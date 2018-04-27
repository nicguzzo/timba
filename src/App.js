import React, { Component } from 'react';
import axios from 'axios'
import parser from './parser';
import Stack from './components/Stack.jsx';
import Card from './components/Card.jsx';
//var CodeMirror = require('react-codemirror');
import * as timba from './timba.js'

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      code: "// Code",
      stacks: [],
      parsed: null,
      hand: [],
      debug: false,
      next: false
    }
    axios.get("tests/test.tba")
    .then(response => {
      this.setState({code: response.data})
    });
  }
  updateCode= (e) => {
    this.setState({
      code: e.target.value,
    });
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
    console.log("parsing timba!!");
    let parsed=null
    try{
      //call the peg parser, if all went well create json
      //representation of the tree, and create the stacks
      parsed=parser.parse(this.state.code.toLowerCase());
      this.setState({parsed: parsed}, () => {
        let [pilas,mano]=timba.initStacks(parsed)
        this.setState( { stacks: pilas ,hand:mano} )
      });
    }catch(err){
      // in case of syntax error, create error message and display it
      console.dir(err);
      if (!(typeof err.expected === 'undefined')){
        var expected=""
        err.expected.forEach(function (item,index,arr) {
          if (item.type === "literal"){
            expected+=", \""+item.text+"\"";
          }
        });
        console.log( "se esperaba \"" +expected+ " pero se encontró \""+ err.found+"\" en la linea "+err.location.start.line+" columna "+err.location.start.column )
      }else{
        console.log(err);
      }
    }
  }
  onParse= (e) => {
    e.preventDefault()
    this.parse();
    this.setState( {debug:true})
  }
  onRun= (e) => { 
    e.preventDefault()
    timba.runProgram(this.state.parsed.sentencias,s =>{
      this.setState( { stacks: this.state.stacks })
    })
  }
  onRunS= (e) => {
    this.setState( { debug:false })
    timba.debugProgram(this.state.parsed.sentencias,20,()=>this.setState( { stacks: this.state.stacks,debug:false }) )
  }
  onDebug= (e) => { 
    e.preventDefault()
    timba.debugProgram(this.state.parsed.sentencias)
    this.setState( {next:true})
  }
  onNext= (e) => { 
    e.preventDefault()
    timba.nextOP()
    this.setState( { stacks: this.state.stacks,debug:false })
  }
  render() {
    let render_stacks=this.state.stacks.map( (s,i)=>{
      //console.log(s)
      //console.log(i)
      return <Stack stackName={s.name} cards={s.cards} x={650+i*120} y={200} key={'stack_'+i} />
    },this)
    return (
      <div>
        <div style={{width:600}} >
          <input type='file' onChange={this.onLoadFile} />
          <button onClick={this.onParse}>parse</button>
          <button onClick={this.onRun} disabled={!this.state.parsed}>run</button>
          <button onClick={this.onRunS} disabled={!this.state.debug}>run slow</button>
          <button onClick={this.onDebug} disabled={!this.state.debug}>debug</button>
          <button onClick={this.onNext} disabled={!this.state.next}>next</button>
          <textarea value={this.state.code} onChange={this.updateCode} cols={80} rows={40}/>

        </div>
        
        <Stack stackName="Mano" cards={this.state.hand} x={650} y={20} />
        
        
        <div style={ {backgroundImage: 'img/bg.jpg'} }>
          {render_stacks}
        </div>
      </div>
    );
  }
}

export default App;
