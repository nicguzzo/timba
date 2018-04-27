let pilas=[]
let pilasByName={}
let mano=[]

function shuffle(a) {
  let j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}

export function initStacks(parsed){

  const palos=["bastos","copas","espadas","oros"];
  const valores=[1,2,3,4,5,6,7,10,11,12];
  pilas=[]
  for (let p = 0, len = parsed.pilas.length; p < len; p++) {
    let pila={};
    pila.name=parsed.pilas[p].nombre
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

  console.log("pilas",pilasByName)
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
    pilasByName[name].push(mano.pop());
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
let cond=function(conditions){
    let r=false;
    const c=conditions.length;
    for(let i=0;i<c;i++){
      switch(conditions[i].type){
        case "empty":
          if (!pilasByName.hasOwnProperty(conditions[i].name)){
            throw new Error("no puedo comparar, la pila "+conditions[i].name+" no existe")
            return r
          }
          switch(conditions[i].cond){
            case "e":
              r=(pilasByName[conditions[i].name].length==0);
            break;
            case "n":
              r=(pilasByName[conditions[i].name].length!=0);
            break;
          }
        break;
        case "estado":
          if(mano.length!=1){
            throw new Error("no puedo comparar, no tengo carta en la mano")
            return r
          }
          switch(conditions[i].cond){
            case "e":
              r=(mano[0].estado==0);
            break;
            case "n":
              r=(mano[0].estado!=0);
            break;
          }
        break;
        case "valor":
          if(mano.length!=1){
            throw new Error("no puedo comparar, no tengo carta en la mano")
            return r
          }
          switch(conditions[i].rel){
            case "eq":
              r= mano[0].num == conditions[i].num
            break;
            case "ne":
              r= mano[0].num != conditions[i].num
            break;
            case "gt":
              r= mano[0].num >  conditions[i].num
            break;
            case "lt":
              r= mano[0].num <  conditions[i].num
            break;
            case "gte":
              r= mano[0].num >= conditions[i].num
            break;
            case "lte":
              r= mano[0].num <= conditions[i].num
            break;
          }
          switch(conditions[i].cond){
            case "e":

            break;
            case "n":
              r=!r;
            break;
          }
        break;
        case "palo":
          if(mano.length!=1){
            throw new Error("no puedo comparar, no tengo carta en la mano");
            return r
          }
          switch(conditions[i].cond){
            case "e":
              r=(mano[0].palo==conditions[i].palo);
            break;
            case "n":
              r=(mano[0].palo!=conditions[i].palo);
            break;
          }
        break;
        case "valor_tope":
        break;
        case "palo_tope":
        break;
      }
    }
    //console.log(r);
    return r;
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
    console.error(e.message)
    alert(e.message)
  }finally{
    cbk()
  }
  
}
let executionStack=[]
let stackLevel=0
let executionTimer=null


export function nextOP(){
  //console.log('stackLevel',stackLevel)
  try{
    let eStack=executionStack[stackLevel]
    if(stackLevel===0 && eStack.sentences && eStack.num>=eStack.sentences.length){
      console.log("stopping")
      clearInterval(executionTimer)
      return
    }
    if(eStack){
      //console.log('eStack',eStack)
      if(eStack.sentences[eStack.num] && eStack.sentences[eStack.num].conditions){
        //console.log('.type ',eStack.sentences[eStack.num])
        if( eStack.sentences[eStack.num].type==="c"){
          if( eStack.sentences[eStack.num].control==="w"){
            
            if(cond(eStack.sentences[eStack.num].conditions)){
              if(eStack.sentences && eStack.num>=eStack.sentences.length){
                executionStack[stackLevel].num=0
              }
            }else{
              console.log("wwww= ") 
              executionStack[stackLevel].num++
              if(stackLevel>=1){
                executionStack.pop()
                stackLevel--
              }
            }
          }else{
            if( eStack.sentences[eStack.num].control==="i"){
              if(eStack.sentences && eStack.num>=eStack.sentences.length){
                
                if(stackLevel>=1){
                  executionStack.pop()
                  stackLevel--
                }
              }
            }
          }
        }
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
              //console.log("tttt= ")  
              executionStack.push({
                num: 0,
                sentences: eStack.sentences[eStack.num].sentencias,
              })
              //executionStack[stackLevel].num++
              stackLevel++
            }
            if( eStack.sentences[eStack.num].control==="i"){
              //console.log("iiii= ") 
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
              executionStack[stackLevel].num++
              stackLevel++
            }
          break;
        }
      }else{
        executionStack[stackLevel].num++
        if(stackLevel>=1){
          executionStack.pop()
          stackLevel--
        }
      }
    }
  }catch(e){
    clearInterval(executionTimer)
    console.error(e.message)
    alert(e.message)
  }
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
        nextOP()
        upd()
    }, timeout)
  }
}