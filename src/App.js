import Game from "./components/Game"
import Editor from "./components/Editor"
import HelpModal from "./components/HelpModal"
import getClassName from "getclassname"
import { Topic, TopicContext } from "./core/topic"
import { useEffect, useRef, useState } from "react"
import { handleEvent } from "./core/WorkerEngine"
import { DebuggerContext } from "./core/debugger"
import "./App.scss"

const topic = Topic();
const isSnake = x => typeof x === "object" && x?.isSnake
const hideSnake = x => {
  const h = { ...x, turnLeft: () => {}, turnRight: () => {}, moveForward: () => {} }
  delete h.isSnake
  return h
}

function App() {
  const [debuggerData, setDebugger] = useState({})
  const [help, setHelp] = useState(false);
  const triggerHelp = () => setHelp(x => !x);
  const editorRef = useRef();
  const handleCloseModal = (reason) => {
    if( reason === "example" ){
      editorRef.current?.showExample?.()
    }
    triggerHelp()
  }

  const handleReactEffects = ({ event, data }) => {
    event.match({
      Help: triggerHelp,
      Persistance: () => setDebugger(prev => ({ ...prev, persistance: data })),
      Running: () => setDebugger(prev => ({ ...prev, running: data })),
      Death: () => setDebugger(prev => ({ ...prev, dead: data })),
      Error: () => setDebugger(prev => ({ ...prev, errors: [...(prev.errors ?? []), data] })),
      CleanErrors: () => setDebugger(prev => ({ ...prev, errors: undefined})),
      Console: () => console.log(...data.args.map(x => isSnake(x) ? hideSnake(x) : x)),
      _: () => console.log(event,data)
    })
  }

  useEffect(() => {
    return topic.subscribe(handleEvent(topic,handleReactEffects))
    // eslint-disable-next-line
  },[])

  const appCl = getClassName({ base: "App" })
  const snakeCl = getClassName({ base: "snake-container", "&--blur": help })
  const editorCl = getClassName({ base: "workspace-container", "&--blur": help })

  return (
    <DebuggerContext.Provider value={debuggerData}>
      <TopicContext.Provider value={topic}>
        <div className={appCl}>
          <HelpModal open={help} onClose={handleCloseModal} />
          <div className={snakeCl}>
            <Game />
          </div>
          <div className={editorCl}>
            <Editor ref={editorRef}/>
          </div>
        </div>
      </TopicContext.Provider>
    </DebuggerContext.Provider>
  );
}

export default App;
