import { EnumType, Functor, Maybe, Union } from "jazzi"

export const Direction = EnumType("Dir",["Up","Down","Left","Right"])
export const Tile = EnumType("Tile",["Empty","Fruit","Wall"]);
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
        "Load",
        "RuntimeError",
        "Console",
        "SnakeAction",
        "Persistance",
        "Running",
        "Error",
        "CleanErrors",
        "Unknown"
    ]
);
Event.fromString = (name) => {
    return Event[name] ?? Event.Unknown
}
export const getTile = (n) => Tile[["Empty","Fruit","Wall"][n]];

const defineIndexGetter = (cases, name, index) => {
    Object.defineProperty(cases.Position.prototype, name, {
        get: function(){
            return this.get()[index]
        }
    })
}
const PositionType = () => (cases) => {
    const curryMapN = n => function(fn){
        return this.map((...values) => {
            const newVals = [...values]
            newVals[n] = fn(newVals[n])
            return newVals;
        })
    }
    cases.Position.prototype.mapN = function(n,fn){ return curryMapN(n)(fn) }
    cases.Position.prototype.mapFirst = curryMapN(0)
    cases.Position.prototype.mapSecond = curryMapN(1)
    cases.Position.prototype.mapThird = curryMapN(2)
    cases.Position.prototype.mapX = curryMapN(0)
    cases.Position.prototype.mapY = curryMapN(1)
    cases.Position.prototype.mapZ = curryMapN(2)

    cases.Position.prototype.equals = function(pos){
        return pos.x === this.x && pos.y === this.y
    }
 
    defineIndexGetter(cases,"x",0);
    defineIndexGetter(cases,"y",1);
    defineIndexGetter(cases,"z",2);
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
            .map(getTile)
            .ifNone(() => Tile.Wall);
    }
    cases.Matrix.prototype.setTile = function(pos,value) {
        const data = this.get()
        data[pos.x][pos.y] = value
        return new cases.Matrix(data);
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
        fromDimensions(x,y,init){

        },
        square(x){ return this.fromDimensions(x,x) }
    }
})