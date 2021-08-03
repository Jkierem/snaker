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
            if( needsWall ){
                let nextWall = randomWall();
                while( 
                    !matrix.getTile(nextWall).isEmpty() ||
                    !matrix.getTile(nextWall.mapX(inc)).isEmpty() ||
                    !matrix.getTile(nextWall.mapX(dec)).isEmpty() || 
                    !matrix.getTile(nextWall.mapY(inc)).isEmpty() || 
                    !matrix.getTile(nextWall.mapY(dec)).isEmpty() || 
                    !matrix.getTile(nextWall.mapX(inc).mapY(inc)).isEmpty() || 
                    !matrix.getTile(nextWall.mapX(dec).mapY(inc)).isEmpty() || 
                    !matrix.getTile(nextWall.mapX(inc).mapY(dec)).isEmpty() || 
                    !matrix.getTile(nextWall.mapX(dec).mapY(dec)).isEmpty() ||
                    nextSnake.map(Position.fromArray).some(p => p.equals(nextWall))
                ) {
                    nextWall = randomWall()
                }
                nextMatrix = nextMatrix.setTile(nextWall, 2);
            }
            return {
                score: prevScore,
                world: nextMatrix.get(),
                snake: nextSnake,
                isDead: nextIsDead,
                walls: needsWall ? prevWalls + 1 : prevWalls
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
            let nextFruit = randomPos()
            const nextMatrix = matrix.setTile(nextPos, 0)
            while( 
                nextSnakePos.some(pos => pos.equals(nextFruit)) ||
                nextMatrix.getTile(nextFruit).isWall()
            ){
                nextFruit = randomPos();
            }
            return {
                score: prevScore + 1,
                world: nextMatrix.setTile(nextFruit, 1).get(),
                snake: nextSnake,
                isDead: nextIsDead,
                walls: prevWalls
            }
        }
    })
}
