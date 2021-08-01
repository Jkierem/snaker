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

export const step = (mat, prevSnake, snakeDir, prevScore) => {
    const matrix = Matrix.of(mat);
    const snake = [...prevSnake];
    const snakeHead = getHead(snake);
    const nextPos = move(snakeHead,snakeDir)
    const nextTile = matrix.getTile(nextPos);
    return nextTile.match({
        Empty: () => {
            const nextSnake = moveSnake(removeTail(snake),snakeDir)
            const nextIsDead = nextSnake.slice(1).map(Position.fromArray).some(p => p.equals(nextPos))
            return {
                score: prevScore,
                world: matrix.get(),
                snake: nextSnake,
                isDead: nextIsDead,
            }
        },
        Wall: () => {
            return {
                score: prevScore,
                world: matrix.get(),
                isDead: true,
                snake,
            }
        },
        Fruit: () => {
            const nextSnake = moveSnake(snake,snakeDir)
            const nextIsDead = nextSnake.slice(1).map(Position.fromArray).some(p => p.equals(nextPos))
            return {
                score: prevScore + 1,
                world: matrix.get(),
                snake: nextSnake,
                isDead: nextIsDead,
            }
        }
    })
}
