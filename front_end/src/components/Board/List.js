import React from 'react';
import {Button,Panel,FormControl} from 'react-bootstrap';
import axios from 'axios'
import Card from './Card.js';

class List extends React.Component{

  constructor(props){
    super(props);    
    //Default State
    this.state={
      cards: [],
      titleNewCard: null,
      showInput: false,
      title: this.props.title,
      pos: this.props.pos // always undefined for now
    }
    
    this.socket = this.props.io;
    this.handleCardTitleInputChange = this.handleCardTitleInputChange.bind(this);
    this.onClickAddCard = this.onClickAddCard.bind(this);
    this.addCard = this.addCard.bind(this);
    this.deleteCards = this.deleteCards.bind(this);
    this.onClickDeleteList= this.onClickDeleteList.bind(this)
    this.getAllCards= this.getAllCards.bind(this)
    this.onClickUpdateList = this.onClickUpdateList.bind(this)
    this.handleTitleinput = this.handleTitleinput.bind(this)
    this.UpdateListTitle = this.UpdateListTitle.bind(this)

    this.socket.emit("getCards", this.props.id, this.props.idBoard)	

    //Event Listeners
    this.socket.on('UpdateListTitle', this.UpdateListTitle);
    this.socket.on('addEmptyCard', this.addCard);
    this.socket.on('deleteCards', this.deleteCards);
    this.socket.on('getAllCards', this.getAllCards);  //We should use componentDidMount() ?
  }

  handleTitleinput = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  render(){
      let headList  = null;
      if(!this.state.showInput) {
        headList = <h3 onClick={this.onClickUpdateList} className='listTitle'>{this.state.title || 'Undefined'}</h3>
      } else{
        headList = <input autoFocus='true' onChange={this.handleTitleinput} onBlur={this.onClickUpdateList} type="text" name="title" value={this.state.title}/>
      }
      return(
        <Panel bsSize="small" className='list'>
          <div className='listHead'>
            {headList}
          </div>
          <div className="listBody">
            {this.cardList(this.state.cards)} 
            <p>
              <FormControl type="text" onChange={this.handleCardTitleInputChange} placeholder="Card Title" />
              <Button className='cardButton' bsStyle="success" onClick={this.onClickAddCard}>Add Card</Button>
              <Button className='cardButton' bsStyle="danger" onClick={this.onClickDeleteList}>Delete Cards</Button>
            </p>
          </div>
        </Panel>
      );
  } 

  getAllCards(cards, id){
    if(id === this.props.id){
      this.setState({cards: cards})
    }
  }

  addCard(card, id){
    if(id === this.props.id){
      this.setState(prevState=>({
        cards: prevState.cards.concat({
          titleCard: card.titleCard,
          description: card.description,
          date: card.date
        })
      }));
    }
  }

  UpdateListTitle(id, title){
    if(id === this.props.id){
      this.setState({title: title})
    }
  }

  onClickUpdateList(e) {
    if (this.state.showInput){
      e.persist()
      axios.put('http://localhost:8000/api/list/' + this.props.id + '/board/' + this.props.idBoard, {
        title: this.state.title,
        pos : this.state.pos
      }).then((response) => {
        this.socket.emit('updateListTitle', this.props.idBoard, this.props.id, e.target.value)
      })
      .catch((error) => {
        alert('An error occured when updating the list')
      })
    }
    this.setState({showInput: !this.state.showInput})
  }

  //Handle Card title input
  handleCardTitleInputChange(e) {  
    this.setState({titleNewCard: e.target.value})
  }

  onClickAddCard(b){
    this.socket.emit('newCardClient', this.state.titleNewCard, this.props.id, this.props.idBoard);
  }

  //Renders the Cards stored in the cards array   
  cardList(list){
    const cards=this.state.cards;
    const cardItems= cards.map((card, index)=>
      <Card key={index} titleCard={card.titleCard} description={card.description} date={card.date}/>
    );
    return cardItems
  }

  onClickDeleteList(){
    this.socket.emit('deleteAllCards', this.props.id, this.props.idBoard);
  }

  deleteCards(idList){
    if(idList === this.props.id)
      this.setState({cards:[]});
  }

}

export default List;