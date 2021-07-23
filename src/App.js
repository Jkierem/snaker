import Game from "./components/Game"
import Editor from "./components/Editor"
import { Topic, TopicContext } from "./core/topic"
import { useEffect } from "react"
import { handleEvent } from "./core/EventHandler"
import "./App.scss"

const topic = Topic();
function App() {

  // const handleEvent = ({ event, data }) => {
  //   if( event.isPlay() ){
  //     terminateWorker(workerRef.current)
  //     .effect(() => {
  //       workerRef.current = undefined
  //     })
  //     spawnWorker(data, snake, world)
  //     .fmap(e => {
  //       e.fmap(worker => {
  //         workerRef.current = worker
  //         worker.addEventListener("message", ({ data }) => {
  //           if(data.type === "Console"){
  //             console[data.fn](...data.args)
  //           } else {
  //             console.log(data)
  //           }
  //         })
  //         worker.postMessage({
  //           type: "Start"
  //         })
  //       })
  //     }).run()
  //   }
  //   if( event === "stop" ){
  //     terminateWorker(workerRef.current)
  //     .effect(() => {
  //       workerRef.current = undefined
  //     })
  //   }
  // }

  useEffect(() => {
    return topic.subscribe(handleEvent(topic))
  },[])
  return (
    <TopicContext.Provider value={topic}>
      <div className="App">
        <div className="snake-container">
          <Game />
        </div>
        <div className="workspace-container">
          <Editor />
        </div>
      </div>
    </TopicContext.Provider>
  );
}

export default App;
