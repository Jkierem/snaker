import { BoxedEnumType, Enum, EnumType, EnumTypeRep, EnumValue, Functor, Maybe, Union,  } from "jazzi"
import { rangeOf } from "../resources/utils";

type EnumValueOf<X> = X extends EnumTypeRep<infer Cases> ? EnumValue<Cases> : never;
type ExtendedEnumRep<Rep extends EnumTypeRep<any>,A> = Rep & A

const DirEnum = EnumType("Dir", ["Up","Down","Left","Right","UpLeft","UpRight","DownLeft","DownRight","Center"]);
type DirValue = EnumValueOf<typeof DirEnum>
export const Direction = DirEnum as ExtendedEnumRep<typeof DirEnum, { fromTuple: (x: number, y: number) => DirValue }>
Direction.fromTuple = (x: number, y: number): DirValue => {
    if( x < 0 ){
        if( y < 0 ){
            return Direction.UpLeft
        } else if( y > 0 ){
            return Direction.DownLeft
        } else {
            return Direction.Left
        }
    } else if ( x > 0 ){
        if( y < 0 ){
            return Direction.UpRight
        } else if( y > 0 ){
            return Direction.DownRight
        } else {
            return Direction.Right
        }
    } else {
        if( y < 0 ){
            return Direction.Up
        } else if( y > 0 ){
            return Direction.Down
        } else {
            return Direction.Center
        }
    }
}

const BoxedTileEnum = BoxedEnumType("BoxedTile",["Empty","Fruit","Wall","Head","Body","Tail"])
export const BoxedTile = 
BoxedTile.mapToBodyPart = (l) => (coord,idx,snake) => {
  if( idx === 0 ){
    const neck = Position.fromArray(snake[idx + 1])
    const head = Position.fromArray(coord)
    const direction = head.substract(neck).toDirection();
    return BoxedTile.Head(direction)
  } else if (idx === l - 1){
    const preTail = Position.fromArray(snake[idx - 1])
    const tail = Position.fromArray(coord)
    const direction = preTail.substract(tail).toDirection();
    return BoxedTile.Tail(direction)
  } else {
    const prev = Position.fromArray(snake[idx - 1])
    const curr = Position.fromArray(coord)
    const next = Position.fromArray(snake[idx + 1])
    const prevDir = curr.substract(prev).toDirection()
    const nextDir = next.substract(curr).toDirection()
    return BoxedTile.Body([prevDir,nextDir])
  }
}

export const Event = EnumType(
    "EditorEvent",
    [
        "Play",
        "Stop",
        "Refresh",
        "Help",
        "SaveCode",
        "Clear",
        "Save",
        "Options",
        "Share",
        "RuntimeError",
        "Console",
        "SnakeAction",
        "Persistance",
        "Running",
        "Error",
        "CleanErrors",
        "Death",
        "Unknown"
    ]
);
Event.fromString = (name) => {
    return Event[name] ?? Event.Unknown
}

const defineIndexGetter = (cases, name, index) => {
    Object.defineProperty(cases.Position.prototype, name, {
        get: function(){
            return this.get()[index]
        }
    })
}
const PositionType = () => (cases) => {
    const curryMapN = n => function(fn){
        return this.fmap((...values) => {
            const newVals = [...values]
            newVals[n] = fn(newVals[n])
            return newVals;
        })
    }
    cases.Position.prototype.mapX = curryMapN(0)
    cases.Position.prototype.mapY = curryMapN(1)

    cases.Position.prototype.substract = function(pos){
        return this.mapX(x => x - pos.x).mapY(y => y - pos.y);
    }

    cases.Position.prototype.normalize = function(){
        return this.map((...values) => values.map(v => v > 0 ? 1 : (v < 0 ? -1 : 0)))
    }

    cases.Position.prototype.toDirection = function(){
        return Direction.fromTuple(...this.normalize().get())
    }

    cases.Position.prototype.equals = function(pos){
        return pos.x === this.x && pos.y === this.y
    }
 
    defineIndexGetter(cases,"x",0);
    defineIndexGetter(cases,"y",1);
}
export const Position = Union({
    name: "Position",
    cases: {
        Position: x => x
    },
    config: { noHelpers: true },
    extensions: [
        PositionType(),
        Functor({
            trivials: [],
            identities: [],
            overrides: {
                fmap:{
                    Position(fn){
                        return Position.Position(fn(...this.get()))
                    }
                }
            }
        })
    ],
    constructors: {
        of(...args){
            return this.Position(args)
        },
        fromArray(args){
            if( Array.isArray(args) ){
                return this.Position(args)
            }
            throw new Error(`fromArray constructor must receive an Array`);
        },
        random2D(rng){
            return this.Position([ rng(), rng()])
        }
    }
})

const MatrixType = () => (cases) => {
    cases.Matrix.prototype.getPosition = function(pos){
        const data = this.get();
        return Maybe
            .fromNullish(data?.[pos.x])
            .chain(row => Maybe.fromNullish(row?.[pos.y]))
    }
    cases.Matrix.prototype.getTile = function(pos){
        return this.getPosition(pos)
            .map(p => typeof p === "number" ? BoxedTile.toEnum(p) : p)
            .onNone(() => BoxedTile.Wall());
    }
    cases.Matrix.prototype.setTile = function(pos,value) {
        const data = this.get()
        data[pos.x][pos.y] = value
        return new cases.Matrix(data);
    }
    cases.Matrix.prototype.map = function(fn){
        const data = this.get()
        const newData = [];
        const xs = data.length
        const ys = data[0].length
        for(let x = 0 ; x < xs ; x++ ){
            newData.push([])
            for(let y = 0 ; y < ys ; y++ ){
                newData[x].push(fn(data[x][y],[x,y]));
            }
        }
        return new cases.Matrix(newData);
    }
    cases.Matrix.prototype.copy = function(){
        return this.map(x => x);
    }
}
export const Matrix = Union({
    name: "Matrix",
    cases: {
        Matrix: x => x,
    },
    config: { noHelpers: true },
    extensions: [MatrixType()],
    constructors: {
        of(mat){
            return this.Matrix(mat)
        },
        fromDimensions(x: number, y: number, init: ){
            return this.Matrix(rangeOf(x,init).map(() => rangeOf(y,init)))
        },
        square(x){ return this.fromDimensions(x,x) },
        copy(mat){ return this.Matrix(mat).copy() }
    }
})

export const Delay = Union({
    name: "Delay",
    cases: {
        Slow  : () => 500,
        Normal: () => 250,
        Fast  : () => 0,
    },
    config: { noHelpers: true },
    extensions: [ Enum({}) ],
    constructors: {},
})