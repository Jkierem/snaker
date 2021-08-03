import { rangeOf } from "../../resources/utils";
import { Direction, Matrix, Position } from "../types";
import { step } from "./step";
import { mkRandom, randomSeed } from "./rand";

const mkSnake = () => rangeOf(3,0).map((_,idx) => ([6+idx,7]))
let randomGen = mkRandom(randomSeed())
const randomInside = () => {
    randomGen = randomGen.next()
    const r = randomGen.value;
    return Math.floor(r % 14); 
}
const randomConstrained = () => {
    randomGen = randomGen.next()
    const r = randomGen.value;
    return Math.floor(r % 13) + 1; 
}
const randomInsidePosition = () => Position.random2D(randomInside)
const randomWall = () => Position.random2D(randomConstrained)
const mkMatrix = () => Matrix.fromDimensions(15,15,0).setTile(randomInsidePosition(),1).get()

export const mkEngine = () => {
    let world = mkMatrix();
    let snake = mkSnake();
    let snakeDir = Direction.Left;
    let isDead = false;
    let score = 0;
    let walls = 0;

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
                walls: nextWalls,
            } = step(world, snake, snakeDir, score, walls, randomInsidePosition, randomWall)
            isDead = nextIsDead;
            world = nextWorld;
            snake = nextSnake;
            score = nextScore;
            walls = nextWalls;
        },
        reset(){
            world = mkMatrix();
            snake =  mkSnake();
            snakeDir = Direction.Left;
            isDead = false;
            score = 0;
            walls = 0;
        },
        get world(){ return world },
        get snake(){ return snake },
        get isDead(){ return isDead }
    }
}