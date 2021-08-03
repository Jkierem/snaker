import { Maybe } from "jazzi"
import { Matrix, Position } from "../types"

const dec = x => x - 1
const inc = x => x + 1

const move = (pos, dir) => {
    return dir.match({
        Up: () => pos.mapY(dec),
        Down: () => pos.mapY(inc),
        Left: () => pos.mapX(dec),
        Right: () => pos.mapX(inc),
    })
}

const getHead = (snake) => {
    return Position.fromArray(snake[0])
}

const removeTail = (snake) => {
    return snake.slice(0,snake.length - 1);
}

const moveSnake = (snake,dir) => {
    return [
        move(getHead(snake),dir).get(),
        ...snake,
    ]
}

const hasPosition = (snake,pos) => snake.map(Position.fromArray).some(p => p.equals(pos));

const getNextWall = (matrix, snake, randomWall, needsWall) => {
    if( !needsWall ){
        return Maybe.None();
    }
    let nextWall = randomWall()
    let tries = 0;
    while(
        tries < 100 && (
        !matrix.getTile(nextWall).isEmpty() ||
        !matrix.getTile(nextWall.mapX(inc)).isEmpty() ||
        !matrix.getTile(nextWall.mapX(dec)).isEmpty() || 
        !matrix.getTile(nextWall.mapY(inc)).isEmpty() || 
        !matrix.getTile(nextWall.mapY(dec)).isEmpty() || 
        !matrix.getTile(nextWall.mapX(inc).mapY(inc)).isEmpty() || 
        !matrix.getTile(nextWall.mapX(dec).mapY(inc)).isEmpty() || 
        !matrix.getTile(nextWall.mapX(inc).mapY(dec)).isEmpty() || 
        !matrix.getTile(nextWall.mapX(dec).mapY(dec)).isEmpty() ||
        hasPosition(snake, nextWall))
    ) {
        nextWall = randomWall()
        tries += 1;
    }
    return Maybe.fromPredicate(() => tries < 100, nextWall)
}

const getNextFruit = (matrix, snake, randomPos) => {
    let tries = 0;
    let nextFruit = randomPos()
    const isSnake = (p) => snake.some(pos => pos.equals(p))
    while( 
        tries < 100 &&
        (isSnake(nextFruit) ||
        matrix.getTile(nextFruit).isWall())
    ){
        nextFruit = randomPos();
        tries += 1;
    }
    return Maybe.fromPredicate(() => tries < 100, nextFruit)
}

export const step = (mat, prevSnake, snakeDir, prevScore, prevWalls, randomPos, randomWall) => {
    const matrix = Matrix.of(mat);
    const snake = [...prevSnake];
    const snakeHead = getHead(snake);
    const nextPos = move(snakeHead,snakeDir)
    const nextTile = matrix.getTile(nextPos);
    const expectedWalls = Math.floor(prevScore / 4)
    const needsWall = prevWalls < expectedWalls && prevWalls < 20;

    return nextTile.match({
        Empty: () => {
            const nextSnake = moveSnake(removeTail(snake),snakeDir)
            const nextIsDead = nextSnake.slice(1).map(Position.fromArray).some(p => p.equals(nextPos))
            let nextMatrix = matrix
            let nextWalls = prevWalls
            getNextWall(matrix,nextSnake,randomWall,needsWall)
                .effect(nextWall => {
                    nextMatrix = nextMatrix.setTile(nextWall, 2);
                    nextWalls += 1
                });
            return {
                score: prevScore,
                world: nextMatrix.get(),
                snake: nextSnake,
                isDead: nextIsDead,
                walls: nextWalls
            }
        },
        Wall: () => {
            return {
                score: prevScore,
                world: matrix.get(),
                isDead: true,
                snake: moveSnake(removeTail(snake),snakeDir),
                walls: prevWalls
            }
        },
        Fruit: () => {
            const nextSnake = moveSnake(snake,snakeDir)
            const nextSnakePos = nextSnake.map(Position.fromArray)
            const nextIsDead = nextSnakePos.slice(1).some(p => p.equals(nextPos))
            let nextMatrix = matrix.setTile(nextPos, 0)
            getNextFruit(nextMatrix, nextSnakePos, randomPos)
            .effect(fruit => {
                nextMatrix = nextMatrix.setTile(fruit,1)
            })
            return {
                score: prevScore + 1,
                world: nextMatrix.get(),
                snake: nextSnake,
                isDead: nextIsDead,
                walls: prevWalls
            }
        }
    })
}
