import React, { Component } from 'react';
import axios from 'axios'
import parser from './parser';
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
      parse_erros: ""
    }
    axios.get("tests/test.tba")
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
    this.setState({parse_erros:""})
    try{
      //call the peg parser, if all went well create json
      //representation of the tree, and create the stacks
      let code=this.state.code.replace(/#.*?$/gm," \n").toLowerCase()
      //console.log(code)
      parsed=parser.parse(code);
      this.setState({parsed: parsed}, () => {
        let [pilas,mano]=timba.initStacks(parsed)
        this.setState( { stacks: pilas ,hand:mano} )
      });
    }catch(err){
      // in case of syntax error, create error message and display it
      //console.dir(err);
      if (!(typeof err.expected === 'undefined')){
        var expected=""
        err.expected.forEach(function (item,index,arr) {
          if (item.type === "literal"){
            expected+=", \""+item.text+"\"";
          }
        });
        const msg="se esperaba \"" +expected+ " pero se encontró \""+ err.found+"\" en la linea "+err.location.start.line+" columna "+err.location.start.column
        this.setState({parse_erros:msg})
      }else{
        console.log(err);
      }
    }
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
      timba.debugProgram(this.state.parsed.sentencias,100,()=>this.setState( { stacks: this.state.stacks,debug:false }) )
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
      console.log("line ",line)
      this.refs.aceEditor.editor.gotoLine(line, 0)
      this.setState( { stacks: this.state.stacks,debug:false })
    }

  }
  render() {
    //<textarea id="editor" value={this.state.code} onChange={this.updateCode} />
    let render_stacks=this.state.stacks.map( (s,i)=>{
      //console.log(s)
      //console.log(i)
      return <Stack stackName={s.name} cards={s.cards} x={510+i*120} y={200} key={'stack_'+i} />
    },this)
    return (
      <div style={ {backgroundImage: `url('img/bg.jpg')`,height: "100%",backgroundRepeat: 'repeat'} }>
        <div style={{width:600 , height: 40 , paddingTop: 20} } >
          
          
          <label for="file-upload" className="custom-file-upload">
             <a className="btn">Open</a>
          </label>
          <input id="file-upload" type="file" onChange={this.onLoadFile}/> &nbsp;

          <a className="btn" onClick={this.onParse} >Parse</a>&nbsp;
          <a className={"btn "+ ((this.state.parsed) ? "": "disabled")} onClick={this.onRun}   >Run</a> &nbsp;
          <a className={"btn "+ ((this.state.parsed) ? "": "disabled")} onClick={this.onRunS}  >Run slow</a> &nbsp;
          <a className={"btn "+ ((this.state.parsed) ? "": "disabled")} onClick={this.onStop}  >Stop</a> &nbsp;
          <a className={"btn "+ ((this.state.parsed) ? "": "disabled")} onClick={this.onNext}  >Next</a> &nbsp;
          

        </div>
        
        <Stack stackName="Mano" cards={this.state.hand} x={510} y={20} />
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
            {this.state.parse_erros}
        </div>

        <div >
          {render_stacks}
        </div>
      </div>
    );
  }
}

export default App;
