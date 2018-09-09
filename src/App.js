import React, { Component } from 'react';
import axios from 'axios'

import Stack from './components/Stack.jsx';
import Card from './components/Card.jsx';
import * as timba from './timba.js'
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/theme/monokai';
import 'brace/mode/java';
import TimbaMode from './mode-timba';
import './App.css'

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      code: "// Code",
      stacks: [],
      parsed: null,
      hand: [],
      debug: false,
      next: false,
      parse_errors: ""
    }
    axios.get("tests/template.tba")
    .then(response => {
      this.setState({code: response.data})
    });
  }
  componentDidMount() {
    const customMode = new TimbaMode();
    this.refs.aceEditor.editor.getSession().setMode(customMode);
  }
  onChange=(newValue) =>{
      this.setState({code: newValue});
  }
  
  onLoadFile = (e) =>{
    let file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload =(e) =>{
      this.setState({code: e.target.result})

    };
    reader.readAsText(file);
  }

  parse = () => {
    //console.log("parsing timba!!");
    let parsed=null
    this.setState({parse_errors:timba.get_exec_error()})
    parsed=timba.parse(this.state.code)
    console.log(parsed)
    this.setState({parsed: parsed}, () => {
      if(parsed){
        let [pilas,mano]=timba.getStacks(parsed)
        this.setState( { stacks: pilas ,hand:mano,parse_errors:""} )
      }
    });
  }
  onParse= (e) => {
    e.preventDefault()
    this.parse();
    this.setState( {debug:true,next:true})
  }
  onRun= (e) => { 
    e.preventDefault()
    if(this.state.parsed){
      this.setState( {debug:false,next:false})
      timba.runProgram(this.state.parsed.sentencias,s =>{
        this.setState( { stacks: this.state.stacks })
      })
    }
  }
  onRunS= (e) => {
    this.setState( { debug:false,next:false })
    if(this.state.parsed){
      timba.debugProgram(this.state.parsed.sentencias,200,(line)=>{
        this.refs.aceEditor.editor.gotoLine(line, 0,true)
        this.setState( { stacks: this.state.stacks,debug:false })
      })
    }
  }
  onStop= (e) => { 
    e.preventDefault()
    timba.stopProgram()
  }
  onNext= (e) => { 
    e.preventDefault()
    if(this.state.parsed && this.state.next){
      if(this.state.debug){
        timba.debugProgram(this.state.parsed.sentencias)
      }
      const line=timba.nextOP()
      //console.log("line ",line)
      this.refs.aceEditor.editor.gotoLine(line, 0,true)
      this.setState( { stacks: this.state.stacks,debug:false })
    }

  }
  onOpen= (e) => { 
    document.getElementById('file-upload').click()
  }
  render() {
    //<textarea id="editor" value={this.state.code} onChange={this.updateCode} />
    let render_stacks=this.state.stacks.map( (s,i)=>{
      //console.log(s)
      //console.log(i)
      return <Stack stackName={s.name} cards={s.cards} x={550+i*120} y={240} key={'stack_'+i} />
    },this)
    return (
      <div style={ {height: "100%",backgroundColor: '#272822',paddingLeft: "20px"} }>

        <input id="file-upload" type="file" className="" onChange={this.onLoadFile} accept=".tba" 
        />
        <div style={{width:600 , height: 40 , paddingTop: 20} } >
          
          
          
          <button className="btn" onClick={this.onOpen} > Abrir </button>
          

          <button className="btn" onClick={this.onParse} >Verificar                                                 </button>
          <button className={"btn "} disabled={!this.state.parsed} onClick={this.onRun}   >Ejecutar       </button>
          <button className={"btn "} disabled={!this.state.debug} onClick={this.onRunS}  >Ejecutar lento </button>
          <button className={"btn "} disabled={!this.state.parsed} onClick={this.onStop}  >Detener        </button>
          <button className={"btn "} disabled={!this.state.next} onClick={this.onNext}  >Siguiente      </button>
          

        </div>
        
        <Stack stackName="Mano" cards={this.state.hand} x={550} y={40} />
        <br/>
        <AceEditor
          width="500px"
          height="500px"
          ref="aceEditor"
          mode="text"
          theme="monokai"
          name="blah2"
          onLoad={this.onLoad}
          onChange={this.onChange}
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          value={this.state.code}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
        <br/>

        <div className="parseError" >
            {this.state.parse_errors}
        </div>

        <div >
          {render_stacks}
        </div>
      </div>
    );
  }
}

export default App;
