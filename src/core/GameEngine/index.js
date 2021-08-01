import { rangeOf } from "../../resources/utils";
import { Direction, Matrix } from "../types";
import { step } from "./step";

export const mkEngine = () => {
    let world = Matrix.fromDimensions(15,15,0).get()
    let snake =  rangeOf(3,0).map((_,idx) => ([7,6+idx]));
    let snakeDir = Direction.Left;
    let isDead = false;
    let score = 0;

    return {
        turnLeft: () => {
            snakeDir = snakeDir.match({
                Left : () => Direction.Down,
                Right: () => Direction.Up,
                Down : () => Direction.Right,
                Up   : () => Direction.Left
            })
        },
        turnRight: () => {
            snakeDir = snakeDir.match({
                Left : () => Direction.Up,
                Right: () => Direction.Down,
                Down : () => Direction.Left,
                Up   : () => Direction.Right
            })
        },
        runStep: () => {
            const { 
                isDead: nextIsDead,
                world: nextWorld, 
                snake: nextSnake,
                score: nextScore,
            } = step(world, snake, snakeDir, score)
            isDead = nextIsDead;
            world = nextWorld;
            snake = nextSnake;
            score = nextScore;
        },
        get world(){ return world },
        get snake(){ return snake },
        get isDead(){ return isDead }
    }
}