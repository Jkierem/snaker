import { rangeOf } from "../../resources/utils";
import { Delay, Direction, Matrix, Position } from "../types";
import { step } from "./step";
import { mkRandom, randomSeed } from "./rand";

let seed = randomSeed()
let randomGen = mkRandom(seed)
const random = (min,max) => {
    const r = randomGen.value;
    randomGen = randomGen.next()
    return Math.floor(r % max) + min; 
}
const randomInsidePosition = () => Position.random2D(() => random(0,15))
const randomWall = () => Position.random2D(() => random(1,13))
const mkSnake = () => rangeOf(3,0).map((_,idx) => ([6+idx,7]))
const mkMatrix = () => Matrix.fromDimensions(15,15,0).setTile(randomInsidePosition(),1).get()

export const mkEngine = () => {
    let world = mkMatrix();
    let snake = mkSnake();
    let snakeDir = Direction.Left;
    let isDead = false;
    let score = 0;
    let walls = 0;
    let delay = Delay.Normal();
    let deterministic = false;

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
            if( deterministic ){
                randomGen = mkRandom(seed)
            }
            world = mkMatrix();
            snake =  mkSnake();
            snakeDir = Direction.Left;
            isDead = false;
            score = 0;
            walls = 0;
        },
        makeDeterministic(newSeed){
            seed = newSeed
            randomGen = mkRandom(seed);
            deterministic = true;
        },
        makeNonDeterministic(){
            seed = randomSeed()
            randomGen = mkRandom(seed);
            deterministic = false;
        },
        setDelay(d){
            delay = Delay.toEnum(d); 
        },
        setSeed(d){
            seed = d
        },
        get world(){ return world },
        get snake(){ return snake },
        get score(){ return score },
        get delay(){ return delay },
        get isDead(){ return isDead },
        get seed(){ return seed },
        get deterministic(){ return deterministic },
    }
}