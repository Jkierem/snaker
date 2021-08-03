const [turns, setTurns] = useState('turns',0);
const [ticks, setTicks] = useState('ticks',0);
const inc = x => x + 1;

const FREE  = 0;
const FRUIT = 1;
const WALL  = 2;

const is = type => ([x,y]) => World[x][y] === type;
const isFree = is(FREE);
const isFruit = is(FRUIT);
const isWall = is(WALL);
const isOutOfBounds = ([x,y]) => x < 0 || x >= 15 || y < 0 || y >= 15 ;
const isBody = ([x0,y0]) => [Snake.head,...Snake.body].some(([x,y]) => x === x0 && y === y0)

const head = Snake.head;
const neck = Snake.body[0];
const direction = head.map((val,idx) => val - neck[idx]);
const nextTile = head.map((val,idx) => val + direction[idx]);

const rotateLeft = ([x,y]) => {
    if( x == 1  ){ return [0,-1] }
    if( x == 0  ){ return [y === 1 ? 1 : -1 , 0] }
    if( x == -1 ){ return [0,1]}
}
const rotateRight = ([x,y]) => {
    if( x == 1  ){ return [0,1] }
    if( x == 0  ){ return [y === 1 ? -1 : 1 , 0] }
    if( x == -1 ){ return [0,-1]}
}

if( isOutOfBounds(nextTile) || isWall(nextTile) || isBody(nextTile) ){
    Snake.turnLeft();
    setTurns(inc);
    console.log(`Turning right for the ${turns + 1}-nth time`);
} else {
    const makeTurn = Math.floor(Math.random() * 100) % 5
    if( makeTurn === 0 ){
        const Left = rotateLeft(direction)
        const left = head.map((val,idx) => val + Left[idx])
        if(!isOutOfBounds(left) && !isBody(left)){
            Snake.turnLeft()
        }
    }
    if( makeTurn === 1 ){
        const Right = rotateRight(direction)
        const right = head.map((val,idx) => val + Right[idx])
        if(!isOutOfBounds(right) && !isBody(right)){
            Snake.turnRight()
        }
    }
}
setTicks(inc);