let pilas=[]
let mano={}
function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}
export function init_stacks(parsed){

  const palos=["bastos","copas","espadas","oros"];
  const valores=[1,2,3,4,5,6,7,10,11,12];

  for (var p = 0, len = parsed.pilas.length; p < len; p++) {
    let pila={};
    pila.name=parsed.pilas[p].nombre
    pila.cards=[]
    switch(parsed.pilas[p].contenido.tipo){
      case "vacio":
      break;
      case "lista":
        for (var c = 0, len2 = parsed.pilas[p].contenido.list.length; c < len2; c++) {
          pila.cards.push(parsed.pilas[p].contenido.list[c]);
        }
      break;
      case "mazo_completo":
        var e=parsed.pilas[p].contenido.estado;
        var ee=e;
        for (var i = 0, plen = palos.length; i < plen; i++) {
          for (var j = 0, vlen = valores.length; j < vlen; j++) {
            if (e==2){
              ee=Math.floor(Math.random() * 2);
            }
            pila.push({num: valores[j],palo: palos[i],estado: ee})
          }
        }
        shuffle(pila.cards);
      break;
      case "mazo_n_cartas":
        var e=parsed.pilas[p].contenido.estado;
        var ee=e;
        var tmp=[];
        for (var i = 0, plen = palos.length; i < plen; i++) {
          for (var j = 0, vlen = valores.length; j < vlen; j++) {
            //console.log({num: parseInt(valores[j]),palo: palos[i]})
            if (e==2){
              ee=Math.floor(Math.random() * 2);
            }
            tmp.push({num: valores[j],palo: palos[i],estado: ee})
          }
        }
        for (var k = 0; k < parsed.pilas[p].contenido.n ; k++){
          var i=Math.floor(Math.random() * tmp.length);
          pila.cards.push(tmp[i]);
          tmp.splice(i,1);
        }
      break;
    }
    pilas.push(pila)
  }
  //this.setState( { stacks: pilas } )
  console.log("pilas",pilas)
  return pilas;
}
function tomar(name){
  if (pilas[name].length>0){
    if(mano.length==0){
      mano.push(pilas[name].pop())
      //console.log(mano)
    }else{
      console.log("no puedo tomar, ya tengo carta en la mano");
    }
  }else{
    console.log("no puedo tomar, la pila "+name+" esta vacia");
  }
}
function depositar(name){
  if(mano.length==1){
    pilas[name].push(mano.pop());
  }else{
    console.log("no puedo depositar, no tengo carta en la mano");
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
    console.log("no puedo invertir, no tengo carta en la mano");
  }
};
function run_op(op){
  console.log(op)
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
var cond=function(conditions){
    var r=false;
    var c=conditions.length;
    for(var i=0;i<c;i++){
      switch(conditions[i].type){
        case "empty":
          if (!pilas.hasOwnProperty(conditions[i].name)){
            console.log("no puedo comparar, la pila "+conditions[i].name+" no existe");
            break;
            break;
          }
          switch(conditions[i].cond){
            case "e":
              r=(pilas[conditions[i].name].length==0);
            break;
            case "n":
              r=(pilas[conditions[i].name].length!=0);
            break;
          }
        break;
        case "estado":
          if(mano.length!=1){
            console.log("no puedo comparar, no tengo carta en la mano");
            //$scope.stop();
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
            console.log("no puedo comparar, no tengo carta en la mano");
            //$scope.stop();
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
            console.log("no puedo comparar, no tengo carta en la mano");
            //$scope.stop();
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
export function run_program(sentencias){
  var l=sentencias.length;
  for(var i=0;i<l;i++){
    //console.log(sentencias[i].type)
    switch(sentencias[i].type)
    {
      case "o"://operativas
        run_op(sentencias[i]);
      break;
      case "c":// control
        switch(sentencias[i].control)
        {
          case "w":
            while(cond(sentencias[i].conditions)){
              run_program(sentencias[i].sentencias);
            }
          break;
          case "i":
            if(cond(sentencias[i].conditions)){
              run_program(sentencias[i].on_true);
            }else{
              if(sentencias[i].on_false!=null){
                run_program(sentencias[i].on_false);
              }
            }
          break;
        }
      break;
    }
  }
}