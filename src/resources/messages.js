export const helpMessage = "// For info on how to play click on help"

export const example = `// This is the simplest and slowest method and will surely die when walls spawn
// Remember to open the console to see your console.log calls
const [turns, setTurns] = useState('turns',0);
const inc = x => x + 1;

const FREE  = 0;
const FRUIT = 1;
const WALL  = 2;

const is = type => ([x,y]) => World[x][y] === type;
const isWall = is(WALL);
const isOutOfBounds = ([x,y]) => x < 0 || x >= 15 || y < 0 || y >= 15 ;

const head = Snake.head;
const neck = Snake.body[0];
const direction = head.map((val,idx) => val - neck[idx]);
const nextTile = head.map((val,idx) => val + direction[idx]);

function findFruit(){
    for(let i = 0 ; i < World.length ; i++ ){
        for(let j = 0 ; j < World[i].length ; j++ ){
            if( World[i][j] === FRUIT ){
                return [i,j]
            }
        }
    }
}

const fruit = findFruit();

const fruitIsToTheRight = 
    head[0] <= fruit[0] 
    && head[1] === fruit[1] 
    && direction[0] !== 1;

if( isOutOfBounds(nextTile) || isWall(nextTile) || fruitIsToTheRight ){
    Snake.turnRight();
    setTurns(inc);
    console.log(\`Turning right for the \${turns + 1}-nth time\`);
}
`