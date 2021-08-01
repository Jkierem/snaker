const m = 743432380
const a = 876441
const c = 213457
const step = x => (a * x + c) % m;

export const randomSeed = () => 9999999 * Math.random();

export const mkRandom = (seed) => {
    const x = step(seed)
    return {
        get value(){ return x },
        next: () => mkRandom(x),
    }
}

export function* randomGen(seed) {
    let x = step(seed);
    while(true){
        yield x;
        x = step(x);
    }
}