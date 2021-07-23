const helpMessage = `/**
* Your goal is to get to the fruit 100 times as fast as possible.
* Your code will run every frame of the game and you should treat it as a function that receives the global objects/functions
* There are four global objects/functions at your disposal: (in typescript notation)
* type Snake = {
*    turnLeft: () => void,
*    turnRight: () => void,
*    body: [number,number][],
*    head: [number,number],
*    length: number
* }
* type World = Array<Array<0 | 1 | 2>>
* type console = { log: (...args: any[]) => void }
* type useState = <T>(id: string, initialValue: T) => [T, (newValue: any) => void ]; 
* 
* Every frame, this code will execute. If no function is called on the Snake, the snake will move forward. 
* 
* The World is a two dimensional array where the top left corner is World[0][0]. Each value is either a 0 for empty space, a 1 for fruit and 2 for an obstacle. The world does not include the snake's body. 
* 
* The console object is for debugging. The messages will show up in the console that is below the editor.
* 
* The useState hook function is similar to React's useState, with a minor difference in that it receives an ID so that you can use it anywhere with less limitations.
* 
* The only two limitations are that it only guarantees equality (==) rather than identity (===) of primitive values between runs and can only contain values handled by the structured clone algorithm (more info https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
*
* If the snake dies by either hitting a wall, going out of bounds or hitting itself, click the red Stop button to try again.
*
* There is no infinite loop prevention. To kill an infinite loop, close the tab
* 
* Auto saved is enabled. No need to save your code.
*
* You can see all this information by pressing the Help button
*/`

export default helpMessage