import parser from './parser';

let pilas=[]
let pilasByName={}
let mano=[]
var exec_error=""
let parsed=null
function shuffle(a) {
  let j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}
export function get_exec_error(){
  return exec_error
}
function onError(e){
  exec_error=e.message
  if (!(typeof e.expected === 'undefined')){
    var expected=""
    e.expected.forEach(function (item,index,arr) {
      if (item.type === "literal"){
        expected+=", \""+item.text+"\"";
      }
    });
    const msg="se esperaba \"" +expected+ " pero se encontró \""+ e.found+"\" en la linea "+e.location.start.line+" columna "+e.location.start.column
    exec_error=msg
  }else{
    console.log('error: ',e);
    exec_error=e.message
  }
}
export function parse (code){
  //console.log("parsing timba!!");
  console.log('code',code)
  let parsed=null
  try{
    //call the peg parser, if all went well create json
    //representation of the tree, and create the stacks
    let cleancode=code.replace(/#.*?$/gm,"").toLowerCase()
    console.log('cleancode: ',cleancode)
    console.log('parsing...')
    parsed=parser.parse(cleancode);
    console.log('done.')
    console.log('parsed: ',parsed)
  }catch(e){
    onError(e)
  }finally{
    if(parsed)
      initStacks(parsed)
  }
  return parsed
}
export function getStacks(parsed){
  return [pilas,mano];
}
export function initStacks(parsed){

  const palos=["bastos","copas","espadas","oros"];
  const valores=[1,2,3,4,5,6,7,10,11,12];
  pilas=[]
  pilasByName={}
  mano=[]
  for (let p = 0, len = parsed.pilas.length; p < len; p++) {
    let pila={};
    pila.name=parsed.pilas[p].name
    pila.cards=[]

    switch(parsed.pilas[p].contenido.tipo){
      case "vacio":
      break;
      case "lista":
        for (let c = 0, len2 = parsed.pilas[p].contenido.list.length; c < len2; c++) {
          pila.cards.push(parsed.pilas[p].contenido.list[c]);
        }
      break;
      case "mazo_completo":

        for (let i = 0, plen = palos.length; i < plen; i++) {
          for (let j = 0, vlen = valores.length; j < vlen; j++) {
            let e=parsed.pilas[p].contenido.estado;
            if (e===2){
              e=Math.floor(Math.random() * 2);
            }
            pila.push({num: valores[j],palo: palos[i],estado: e})
          }
        }
        shuffle(pila.cards);
      break;
      case "mazo_n_cartas":

        let tmp=[];
        for (let i = 0, plen = palos.length; i < plen; i++) {
          for (let j = 0, vlen = valores.length; j < vlen; j++) {
            let e=parsed.pilas[p].contenido.estado;
            if (e===2){
              e=Math.floor(Math.random() * 2);
            }
            tmp.push({num: valores[j],palo: palos[i],estado: e})
          }
        }
        for (let k = 0; k < parsed.pilas[p].contenido.n ; k++){
          let i=Math.floor(Math.random() * tmp.length);
          pila.cards.push(tmp[i]);
          tmp.splice(i,1);
        }
      break;
    }
    pilas.push(pila)

    pilasByName[pila.name]=pila.cards
  }

  return [pilas,mano];
}
function tomar(name){
  if (pilasByName[name].length>0){
    if(mano.length==0){
      mano.push(pilasByName[name].pop())
      //console.log('mano',mano)
    }else{
      throw new Error("no puedo tomar, ya tengo carta en la mano")
    }
  }else{
    throw new Error("no puedo tomar, la pila "+name+" esta vacia")
  }
}
function depositar(name){
  if(mano.length==1){
    if(pilasByName[name]){
      pilasByName[name].push(mano.pop());
    }else{
      throw new Error("no puedo depositar, pila "+name+" no existe")
    }
  }else{
    throw new Error("no puedo depositar, no tengo carta en la mano")
  }
}
function invertir(){
  if(mano.length==1){
    //console.log("before "+mano.estado);
    if(mano[0].estado==1){
      mano[0].estado=0;
    }else{
      mano[0].estado=1;
    }
    //console.log("after "+mano.estado+"\n\n");
  }else{
    throw new Error("no puedo invertir, no tengo carta en la mano")
  }
};
function runOp(op){
  //console.log('op',op)
  switch(op.op){
    case "t"://tomar
      tomar(op.name);
    break;
    case "d":// depositar
      depositar(op.name);
    break;
    case "i":// invertir
      invertir();
    break;
  }
}
function checkStackExists(name){
  return pilasByName.hasOwnProperty(name)
}
function checkStackEmpty(name){
  return (pilasByName[name].length===0)
}
let cond=function(conditions){
    let rr=false;
    const c=conditions.length;
    //console.log("conditions",conditions)
    for(let i=0;i<c;i++){
      let r=false;
      let cond=conditions[i]

      if(cond.hasOwnProperty('op_logico')){
        cond=cond.cond
      }
      //console.log("cond",cond)

      switch(cond.type){
        case "empty":{
          //console.log("empty ",cond.name)
          if (!checkStackExists(cond.name)){
            throw new Error("no puedo comparar, la pila "+cond.name+" no existe")
          }
          switch(cond.cond){
            case "e":
              r=(pilasByName[cond.name].length===0);
            break;
            case "n":
              r=(pilasByName[cond.name].length!==0);
            break;
          }
          //console.log("empty ",cond.name," r=",r)
        }
        break;
        case "estado":{
          if(mano.length!==1){
            throw new Error("no puedo comparar, no tengo carta en la mano")
          }
          switch(cond.cond){
            case "e":
              r=(mano[0].estado===0);
            break;
            case "n":
              r=(mano[0].estado!==0);
            break;
          }
        }
        break;
        case "valor":{
          if(mano.length!==1){
            throw new Error("no puedo comparar, no tengo carta en la mano")
          }
          console.log("cond.rel: ",cond.rel)
          console.log(mano[0].num,cond.rel, cond.num)
          switch(cond.rel){
            case "eq":
              r= mano[0].num === cond.num
            break;
            case "ne":
              r= mano[0].num !== cond.num
            break;
            case "gt":
              r= mano[0].num >  cond.num
            break;
            case "lt":
              r= mano[0].num <  cond.num
            break;
            case "gte":
              r= mano[0].num >= cond.num
            break;
            case "lte":
              r= mano[0].num <= cond.num
            break;
          }
          switch(cond.cond){
            case "e":

            break;
            case "n":
              r=!r;
            break;
          }
        }
        break;
        case "palo":{
          if(mano.length!=1){
            throw new Error("no puedo comparar, no tengo carta en la mano");
          }
          switch(cond.cond){
            case "e":
              r=(mano[0].palo===cond.palo);
            break;
            case "n":
              r=(mano[0].palo!==cond.palo);
            break;
          }
        }
        break;
        case "valor_tope":{
          if(!checkStackExists(cond.name)){
            throw new Error("no puedo comparar, la pila "+cond.name+" no existe")
          }
          if(checkStackEmpty(cond.name)){
            throw new Error("no puedo comparar, la pila "+cond.name+" esta vacia")
          }
          if(mano.length!=1){
            throw new Error("no puedo comparar, no tengo carta en la mano");
          }
          const tope=pilasByName[cond.name].length-1
          const num=pilasByName[cond.name][tope].num;
          switch(cond.rel){
            case "eq":
              r= (num===mano[0].num)
            break;
            case "ne":
              r= (num!==mano[0].num)
            break;
            case "gt":
              r= mano[0].num > num
            break;
            case "lt":
              r= mano[0].num < num
            break;
            case "gte":
              r= mano[0].num >= num
            break;
            case "lte":
              r= mano[0].num <= num
            break;
          }
          switch(cond.cond){
            case "e":

            break;
            case "n":
              r=!r;
            break;
          }
        }
        break;
        case "palo_tope":
        {
          if(checkStackExists(conditions[i])){
            throw new Error("no puedo comparar, la pila "+cond.name+" no existe")
          }
          if(checkStackEmpty(cond.name)){
            throw new Error("no puedo comparar, la pila "+cond.name+" esta vacia")
          }
          if(mano.length!=1){
            throw new Error("no puedo comparar, no tengo carta en la mano");
          }
          const tope=pilasByName[cond.name].length-1
          const suit=pilasByName[cond.name][tope].suit;
          switch(cond.cond){
            case "e":
              r=(mano[0].palo===suit)
            break;
            case "n":
              r=(mano[0].palo!==suit)
            break;
          }
        }
        break;
      }
      //console.log("r[",i,"]=",r);
      if(conditions[i].op_logico){
        //console.log("op_logico",conditions[i].op_logico);
        //console.log("op_logico rr=",rr,' r=',r);
        switch(conditions[i].op_logico){
          case "y":
           rr = rr && r
          break;
          case "o":
            rr = rr || r
          break;
        }
      }else{
        rr=r
      }
    }
    //console.log("cond=",rr);
    return rr;
  }
function _runProgram(sentencias){
  let l=sentencias.length;
  for(let i=0;i<l;i++){
    //console.log(sentencias[i].type)
    switch(sentencias[i].type)
    {
      case "o"://operativas
        runOp(sentencias[i]);
      break;
      case "c":// control
        switch(sentencias[i].control)
        {
          case "w":
            while(cond(sentencias[i].conditions)){
              _runProgram(sentencias[i].sentencias);
            }
          break;
          case "i":
            if(cond(sentencias[i].conditions)){
              _runProgram(sentencias[i].on_true);
            }else{
              if(sentencias[i].on_false!=null){
                _runProgram(sentencias[i].on_false);
              }
            }
          break;
        }
      break;
    }
  }
}
export function runProgram(sentencias,cbk){

  try{
    _runProgram(sentencias)
  }catch(e){
    onError(e)
  }finally{
    cbk()
  }

}
let executionStack=[]
let stackLevel=0
let executionTimer=null
let line=1

export function nextOP(){

  try{
    const eStack=executionStack[stackLevel]

    if(stackLevel===0 && eStack.sentences && eStack.num>=eStack.sentences.length){
      console.log("stopping")
      clearInterval(executionTimer)
      return 1
    }
    //console.log('executionStack',executionStack)
    //console.log('stackLevel',stackLevel)
    if(eStack && eStack.sentences){
      //console.log("num=",eStack.num," sentences.length",eStack.sentences.length)

     // console.log('eStack',eStack)

      if(eStack.num>=eStack.sentences.length){
        line=eStack.sentences[eStack.num-1].loc.end.line-1
      }else{
        line=eStack.sentences[eStack.num].loc.start.line-1
      }
      if(eStack.sentences && eStack.num<eStack.sentences.length){

        switch(eStack.sentences[eStack.num].type)
        {
          case "o"://operativas
            runOp(eStack.sentences[eStack.num]);
            executionStack[stackLevel].num++
          break;
          case "c":// control

            if( eStack.sentences[eStack.num].control==="w"){
              if(cond(eStack.sentences[eStack.num].conditions)){
                executionStack.push({
                  num: 0,
                  sentences: eStack.sentences[eStack.num].sentencias,
                })
                //console.log('executionStack push w',executionStack)
                stackLevel++
              }else{

                executionStack[stackLevel].num++

              }
            }else if( eStack.sentences[eStack.num].control==="i"){
              //console.log("i2")
              if(cond(eStack.sentences[eStack.num].conditions)){
                executionStack.push({
                  num: 0,
                  sentences:  eStack.sentences[eStack.num].on_true
                })
              }else{
                executionStack.push({
                  num: 0,
                  sentences:  eStack.sentences[eStack.num].on_false
                })
              }
              //console.log('executionStack push i',executionStack)
              executionStack[stackLevel].num++
              stackLevel++
            }
          break;
        }
      }else{
        executionStack[stackLevel].num++
        if(stackLevel>=1){
          executionStack.pop()
          //console.log('executionStack pop',executionStack)
          stackLevel--

        }
      }
    }else{
      if(stackLevel>=1){
        executionStack.pop()
        //console.log('executionStack pop',executionStack)
        stackLevel--
      }
    }
  }catch(e){
    clearInterval(executionTimer)
    console.error(e)
    onError(e)

  }
  return line;
}
export function debugProgram(sentencias,timeout=0,upd){
  executionStack=[]
  stackLevel=0
  if(sentencias.length>0){
    executionStack.push({num: 0,sentences:sentencias})
  }
  //console.log('executionStack',executionStack)
  if(timeout>0){
    executionTimer=setInterval(()=>{
        const line=nextOP()
        upd(line)
    }, timeout)
  }
}
export function stopProgram(){
  clearInterval(executionTimer)
}