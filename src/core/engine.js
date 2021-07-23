import { Matrix, Position } from "./types"

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

export const step = (mat, prevSnake, snakeDir) => {
    const matrix = Matrix.of(mat);
    const snake = [...prevSnake];
    const snakeHead = getHead(snake);
    const nextPos = move(snakeHead,snakeDir)
    const nextTile = matrix.getTile(nextPos);

    return nextTile.match({
        Empty: () => {
            const nextSnake = moveSnake(removeTail(snake),snakeDir)
            return {
                world: matrix.get(),
                snake: nextSnake,
                dead: nextSnake.map(Position.fromArray).some(p => p.equals(nextPos)),
            }
        },
        Wall: () => {
            return {
                world: matrix.get(),
                dead: true,
                snake,
            }
        },
        Fruit: () => {
            const nextSnake = moveSnake(snake,snakeDir)
            return {
                world: matrix.get(),
                snake: nextSnake,
                dead: nextSnake.map(Position.fromArray).some(p => p.equals(nextPos)),
            }
        }
    })
}
