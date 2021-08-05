import Game from "./components/Game"
import Editor from "./components/Editor"
import HelpModal from "./components/HelpModal"
import getClassName from "getclassname"
import { Topic, TopicContext } from "./core/topic"
import { useCallback, useEffect, useRef, useState } from "react"
import { handleEvent } from "./core/WorkerEngine"
import { DebuggerContext } from "./core/debugger"
import { mkEngine } from "./core/GameEngine"
import OptionsModal from "./components/OptionsModal"
import { Either, Maybe, stringMatcher } from "jazzi"
import StorageObject from "./middleware/localStorage"
import "./App.scss"

const topic = Topic();
const gameEngine = mkEngine()
const isSnake = x => typeof x === "object" && x?.isSnake
const hideSnake = x => {
  const h = { ...x, turnLeft: () => {}, turnRight: () => {}, moveForward: () => {} }
  delete h.isSnake
  return h
}

const useBooleanState = () => {
  const [value, setter] = useState(false)
  const toggle = useCallback(() => setter(x => !x),[setter]) 
  return [value, setter, toggle];
}

const toNumber = (str) => {
  const n = Number(str)
  return Either
    .fromPredicate(() => !Number.isNaN(n) , n)
    .onLeft(() => 0)
}

const Version = () => {
  return <div className="version-container">
    <a 
    className="version"
    title="Check out how this is made" 
    rel="noreferrer" 
    target="_blank" 
    href="https://github.com/Jkierem/snaker">
      v1.1.2
    </a>
    <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/" title="This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.">
      <img alt="Creative Commons License" style={{"borderWidth":"0"}} src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" />
    </a>
  </div>
}

function App() {
  const [debuggerData, setDebugger] = useState({})
  const [help, setHelp , toggleHelp] = useBooleanState();
  const [opts, , toggleOpts] = useBooleanState();
  const editorRef = useRef();

  useEffect(() => {
    StorageObject
      .getFirstTime()
      .then(hasPlayedBefore => {
        Maybe
        .from(hasPlayedBefore)
        .ifNone(() => {
          setHelp(true);
          StorageObject.setFirstTimeKey();
        })
      })
  },[setHelp])

  const handleCloseModal = (reason) => {
    Maybe
    .fromFalsy(reason === "example")
    .chain(() => Maybe.fromNullish(editorRef.current))
    .effect(editor => editor.showExample())
    toggleHelp()
  }

  const handleCloseOpts = (reason,data) => {
    stringMatcher(reason).match({
      "cancel": toggleOpts,
      "save": () => {
        gameEngine.setDelay(data.speed);
        Either
        .fromPredicate(() => data.deterministic)
        .fold(
          () => {
            Maybe
            .fromFalsy(gameEngine.deterministic)
            .effect(() => gameEngine.makeNonDeterministic())
          },
          () => {
            Maybe
            .fromFalsy(!gameEngine.deterministic || `${gameEngine.seed}` !== data.seed)
            .effect(() => gameEngine.makeDeterministic(toNumber(data.seed.trim())))
          }
        )
        toggleOpts()
      }
    })
  }

  const handleReactEffects = ({ event, data }) => {
    event.match({
      Help: toggleHelp,
      Options: toggleOpts,
      Persistance: () => setDebugger(prev => ({ ...prev, persistance: data })),
      Running: () => setDebugger(prev => ({ ...prev, running: data })),
      Death: () => setDebugger(prev => ({ ...prev, dead: data })),
      Error: () => setDebugger(prev => ({ ...prev, errors: [...(prev.errors ?? []), data] })),
      CleanErrors: () => setDebugger(prev => ({ ...prev, errors: undefined})),
      Console: () => console.log(...data.args.map(x => isSnake(x) ? hideSnake(x) : x))
    })
  }

  useEffect(() => {
    return topic.subscribe(handleEvent(topic,gameEngine,handleReactEffects))
    // eslint-disable-next-line
  },[])

  const appCl = getClassName({ base: "App" })
  const snakeCl = getClassName({ base: "snake-container", "&--blur": help || opts })
  const editorCl = getClassName({ base: "workspace-container", "&--blur": help || opts })

  return (
    <DebuggerContext.Provider value={debuggerData}>
      <TopicContext.Provider value={topic}>
        <div className={appCl}>
          <HelpModal open={help} onClose={handleCloseModal} />
          <OptionsModal open={opts} onClose={handleCloseOpts} engine={gameEngine}/>
          <div className={snakeCl}>
            <Game snake={gameEngine.snake} world={gameEngine.world} />
            <h3>Score: {gameEngine.score}</h3>
          </div>
          <div className={editorCl}>
            <Editor ref={editorRef}/>
          </div>
          <Version />
        </div>
      </TopicContext.Provider>
    </DebuggerContext.Provider>
  );
}

export default App;
