import React, { Component } from 'react'

import Card from './Card.jsx';

const style={
 width: "100px", 
 height: "150px", 
 border: "3px solid #9aa5ad", 
 padding:"5px",
 WebkitBorderRadius: 7,
 MozBorderRadius: 7,
 borderRadius: "7px"
}
class Stack extends Component {
 /* constructor(props){
    super(props);
    this.state={
      cards: this.props.cards
    }
  }*/
  render(){
    let stack=this.props.cards.map( function(card,j){
      //console.log("card: " ,card)
      //console.log("card: " ,j)
      return  <Card  key={'card_'+j} card={card} idx={j}/>
    },this);
    const x=this.props.x
    const y=this.props.y
    return (
      <div style={ {position: 'absolute', left: x, top: y } }>
        <b >{this.props.stackName}</b>
        <div style={style }>
          {stack}
        </div>
      </div>
    );
  }
}

export default Stack;