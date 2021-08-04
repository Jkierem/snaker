import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import AceEditor from "react-ace"
import gcn from "getclassname"
import StorageObject from '../../middleware/localStorage';
import { TopicContext } from '../../core/topic';
import { Event } from "../../core/types"
import { getVariant, Maybe } from 'jazzi';
import { useDebugger } from '../../core/debugger';
import { example } from '../../resources/messages';
import "./Editor.scss"

import "ace-builds/webpack-resolver";
import "ace-builds/src-min-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/keybinding-vscode";
import "ace-builds/src-min-noconflict/snippets/javascript";
import "ace-builds/src-min-noconflict/snippets/text";

const toolbarCl = gcn({ base: 'toolbar' })
const buttonCl = toolbarCl.element('button')
const buttonLabelCl = buttonCl.element('label')
const playIconCl = toolbarCl.element('play-icon')
const stopIconCl = toolbarCl.element('stop-icon')
const refreshIconCl = toolbarCl.element('refresh-icon')
const helpIconCl = toolbarCl.element('help-icon')

const EventButton = ({ type, onClick }) => {
  const iconClass = type.match({
    Play: () => Maybe.from(playIconCl),
    Stop: () => Maybe.from(stopIconCl),
    Refresh: () => Maybe.from(refreshIconCl),
    Help: () => Maybe.from(helpIconCl),
    _: Maybe.None
  })

  const color = type.match({
    Play: () => "primary",
    Stop: () => "danger",
    Refresh: () => "alt",
    Help: () => "help",
    _: () => "fallback"
  })

  const style = {
    '--color': `var(--${color})`,
    '--color-alt': `var(--${color}-dark)`,
  }

  const handleClick = () => {
    onClick?.(type)
  }

  return <div 
    className={buttonCl}
    style={style}
    onClick={handleClick}
  >
    { 
      iconClass
        .fmap(cl => <i className={cl} />)
        .onNone(() => <></>)
    }
    <div className={buttonLabelCl}>{getVariant(type)}</div>
  </div>
}

const parseValue = (val) => {
  const t = typeof val;
  switch(t){
    case "undefined":
    case "boolean":
    case "number":
    case "bigint":
    case "string":
    case "symbol":
      return val
    case "object":
      return JSON.stringify(val)
    case "function":
      return `[Function ${val.name}]`
    default:
      return val
  }
}

const Editor = React.forwardRef((props,ref) => {
  const debuggerData = useDebugger();
  const { persistance, running, errors, dead } = debuggerData
  const annotations = errors ? errors.map(x => ({ ...x, type: "error" })) : []
  const persistanceKeys = Object.keys(persistance ?? {}).sort()
  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);
  const editorRef = useRef();

  useEffect(() => {
    StorageObject.load().then(setCode);
  },[])

  useImperativeHandle(ref, () => ({
    showExample: () => setCode(example)
  }))

  const handleCodeChange = (code) => {
    setCode(code)
    topic.emit(Event.SaveCode, code)
    topic.emit(Event.CleanErrors)
  }

  const topic = useContext(TopicContext);
  const handleEvent = (evt) => {
    evt.match({
      Play: () => topic.emit(evt, code),
      Save: () => topic.emit(evt, code),
      "Help | Options": () => {
        topic.emit(evt);
        topic.emit(Event.Stop)
      },
      _: () => topic.emit(evt)
    })
  }

  const aceClass = gcn({
    base: "ace",
    "&--shrink": open,
  })

  const debuggerClass = gcn({
    base: "debugger",
    "&--open": open,
  })

  const debuggerContentCl = debuggerClass.element("content")
  const debuggerContentItemCl = debuggerContentCl.element("item")
  const debuggerIconCl = debuggerClass.element("icon").recompute({ "&--open": open })
  const debuggerIconImageCl = debuggerIconCl.element("image")

  const aceHeight = open ? "54%" : "89%"

  return(
    <>
      <div className={toolbarCl}>
        <EventButton 
          type={Event.Play}
          onClick={handleEvent}
        />
        <EventButton 
          type={Event.Stop}
          onClick={handleEvent}
        />
        <EventButton 
          type={Event.Refresh}
          onClick={handleEvent}
        />
        <EventButton 
          type={Event.Help}
          onClick={handleEvent}
        />
        <EventButton 
          type={Event.Options}
          onClick={handleEvent}
        />
        {/* <EventButton 
          type={Event.Save}
          onClick={handleEvent}
        />
        <EventButton 
          type={Event.Load}
          onClick={handleEvent}
        /> */}
      </div>
      <AceEditor
        width="100%"
        height={aceHeight}
        className={aceClass.toString()}
        mode={running ? "text": "javascript"}
        theme="monokai"
        onChange={handleCodeChange}
        value={code}
        debounceChangePeriod={500}
        fontSize={16}
        showGutter={true}
        fixedWidthGutter={true}
        scrollPastEnd={1}
        enableLiveAutocompletion={true}
        showPrintMargin={false}
        firstLineNumber={0}
        enableSnippets={true}
        vScrollBarAlwaysVisible={false}
        ref={editorRef}
        wrapEnabled={true}
        readOnly={running}
        annotations={annotations}
        setOptions={{
          enableMultiselect: true,
        }}
        onLoad={(editor) => {
          editor.getSession().setUseWorker(false)
        }}
      />
      <div 
        className={debuggerClass} 
        onTransitionEnd={() => editorRef.current.editor.resize()}
      >
        <div 
          className={debuggerIconCl}
          onClick={() => setOpen(x => !x)}
        >
          <div className={debuggerIconImageCl}></div>
        </div>
        <h4>Running: {running? "True" : "False"}</h4>
        <h4>Snake: {dead ? "Dead" : "Alive"}</h4>
        <h4>State:</h4>
        <div className={debuggerContentCl}>
          {
            persistanceKeys.length ? persistanceKeys.map(key => {
              return <div className={debuggerContentItemCl} key={key}>
                <div className="id">ID: {key}</div>
                <div className="value">Value: {parseValue(persistance[key] ?? undefined)}</div>
                <div className="value">Type: {typeof persistance[key] ?? "undefined"}</div>
              </div>
            }) : <div className="fallback">No use of useState detected</div>
          }
        </div>
      </div>
    </>
  )
})

export default Editor;