import React, { useContext, useEffect, useRef, useState } from 'react'
import AceEditor from "react-ace"
import gcn from "getclassname"
import { TopicContext } from '../../core/topic';
import { Event } from "../../core/types"
import { getVariant } from 'jazzi';
import "./Editor.scss"

import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import 'ace-builds/src-min-noconflict/ext-searchbox';
import "ace-builds/src-noconflict/keybinding-vscode";
import "ace-builds/src-noconflict/snippets/javascript";
import StorageObject from '../../middleware/localStorage';

const toolbarCl = gcn({ base: 'toolbar' })
const buttonCl = toolbarCl.element('button')
const buttonLabelCl = buttonCl.element('label')
const playIconCl = toolbarCl.element('play-icon')
const stopIconCl = toolbarCl.element('stop-icon')
const refreshIconCl = toolbarCl.element('refresh-icon')
const helpIconCl = toolbarCl.element('help-icon')


const EventButton = ({ type, onClick }) => {
  const iconClass = type.match({
    Play: () => playIconCl,
    Stop: () => stopIconCl,
    Refresh: () => refreshIconCl,
    Help: () => helpIconCl
  })

  const color = type.match({
    Play: () => "primary",
    Stop: () => "danger",
    Refresh: () => "alt",
    Help: () => "help"
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
    <i className={iconClass} />
    <div className={buttonLabelCl}>{getVariant(type)}</div>
  </div>
}

const Editor = (props) => {

  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);
  const editorRef = useRef();

  useEffect(() => {
    StorageObject.load().then(setCode);
  },[])

  const handleCodeChange = (code) => {
    setCode(code)
    topic.emit(Event.Save, code)
  }

  const topic = useContext(TopicContext);
  const handleEvent = (evt) => {
    topic.emit(evt, evt.isPlay() ? code : undefined)
  }

  const aceClass = gcn({
    base: "ace",
    "&--shrink": open,
  })

  const consoleClass = gcn({
    base: "console",
    "&--open": open,
  })


  const aceHeight = open ? "64%" : "89%"

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
      </div>
      <AceEditor
        width="100%"
        height={aceHeight}
        className={aceClass.toString()}
        mode="javascript"
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
        onLoad={(editor) => {
          editor.getSession().setUseWorker(false)
        }}
      />
      <div 
        className={consoleClass} 
        onClick={() => setOpen(x => !x)}
        onTransitionEnd={() => editorRef.current.editor.resize()}
      >
      </div>
    </>
  )
}

export default Editor;