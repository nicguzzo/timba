import React, { Component } from 'react'

class Card extends Component {
  /*constructor(props){
    super(props);
  }*/
  render(){
    const i=this.props.idx
    let im=''
    if(this.props.card.estado){
      im="img/cards/"+this.props.card.palo+"_"+this.props.card.num+".png"
    }else{
      im="img/cards/carta.png"
    }
    return (
      <div style={ {position: 'absolute', top: (20+i*20), zIndex: i } } >
        <img src={im} alt=""/>
      </div>
    )
  }
}

Card.defaultProps = {
  suit: '',
  card: ''
}

export default Card;