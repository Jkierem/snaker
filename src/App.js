import Game from "./components/Game"
import Editor from "./components/Editor"
import { Topic, TopicContext } from "./core/topic"
import { useEffect, useState } from "react"
import { handleEvent } from "./core/EventHandler"
import "./App.scss"
import { DebuggerContext } from "./core/debugger"

const topic = Topic();
function App() {

  const [debuggerData, setDebugger] = useState({})

  const handleReactEffects = ({ event, data }) => {
    event.match({
      Help: () => {},
      Console: () => console.log(...data.args),
      Persistance: () => setDebugger(prev => ({ ...prev, persistance: data })),
      Running: () => setDebugger(prev => ({ ...prev, running: data })),
      _: () => console.log(event,data)
    })
  }

  useEffect(() => {
    return topic.subscribe(handleEvent(topic,handleReactEffects))
  },[])
  return (
    <DebuggerContext.Provider value={debuggerData}>
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
    </DebuggerContext.Provider>
  );
}

export default App;
