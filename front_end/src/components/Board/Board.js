import React from 'react'
import List from './List.js'
import {Button, FormControl} from 'react-bootstrap'
import './board.css'
import Cascade from './Cascade.js'
import CascadeTeam from './CascadeTeam.js'
import axios from 'axios'
import url from '../../config'
import {Modal, Spin} from 'antd'
import Auth from '../Auth/Auth.js'
import handleServerResponse from '../../response'
import {DragDropContext} from 'react-beautiful-dnd'

class Board extends React.Component{

    constructor(props){
        super(props)

        this.state={
            board: null,
            allTeams: [],
            users: [],
            titleNewList: "",
            parameters: this.props.parentProps.location,
            pageLoaded: false,
            usersBoard:null,
            modalVisible:false,
            cardsInfo:[]
        }

        this.socket = this.props.io
        this.getAllLists = this.getAllLists.bind(this)
        this.onClickAddList = this.onClickAddList.bind(this)
        this.createList = this.createList.bind(this)
        this.deleteList = this.deleteList.bind(this)
        this.renderOptions=this.renderOptions.bind(this)
        this.setModalVisible=this.setModalVisible.bind(this)
        this.updateAllTeams=this.updateAllTeams.bind(this)
        this.updateBoard=this.updateBoard.bind(this)
        this.onDragEnd = this.onDragEnd.bind(this)
        this.addCard = this.addCard.bind(this)
        this.deleteCards = this.deleteCards.bind(this)
        this.deleteCard = this.deleteCard.bind(this)
        this.socket.on('deleteCards', this.deleteCards)
        this.socket.on('deleteCardClient', this.deleteCard)
        this.socket.on('addCard', this.addCard)
        this.socket.on('addList', this.createList)
        this.socket.on('deleteListClient', this.deleteList)
        this.socket.on('updateBoardClient', this.updateBoard)
    }

    componentWillMount() {
        axios.all([this.loadBoard(), this.loadTeams(),this.loadUsers()])
        .then(axios.spread((res1, res2,res3) => {
          this.getAllLists(res1.data.lists)
          const usersBoardArr=res2.data.filter(team=>team.boards.includes(res1.data._id)).map((team)=>{return team.users})
          let usersBoard2=res3.data.filter(usr=>(Array.from(new Set([].concat.apply([],usersBoardArr)))).includes(usr._id))
          this.setState({usersBoard:usersBoard2,board:res1.data,users:res3.data,allTeams:res2.data,pageLoaded:true,cardsInfo:res1.data.cardsInfo})
        }))
    }

    loadTeams(){
        return axios.get(url.api + 'team', url.config)
        .catch((error) => {
            handleServerResponse(error, 'An error occured when getting the teams')
        })
      }

    loadBoard(){
        return axios.get(url.api + 'board/' + this.props.id , url.config)
        .catch((error) => {
            handleServerResponse(error, 'An error occured when getting the board')
        })
    }

    loadUsers(){
        return axios.get(url.api + 'user/', url.config)
         .catch((error) => {
            handleServerResponse(error, 'An error occured when getting all the users')
         })
       }

    onDragEnd = (result) => {
        if(!result.destination) return
        const sourceListIndex=this.state.board.lists.findIndex(l=>l._id===result.source.droppableId)
        const destinationListIndex=this.state.board.lists.findIndex(l=>l._id===result.destination.droppableId)
        let newBoard=this.state.board
        if (sourceListIndex !== destinationListIndex)
        {
            newBoard.lists[destinationListIndex].cards.splice(
                result.destination.index,
                0,
                this.state.board.lists[sourceListIndex].cards[result.source.index]
            )
            newBoard.lists[sourceListIndex].cards.splice(result.source.index, 1)
        } else {
            newBoard.lists[sourceListIndex].cards.splice(result.destination.index, 0, newBoard.lists[sourceListIndex].cards.splice(result.source.index, 1)[0])
        }
        newBoard.lists[sourceListIndex].cards.forEach((card, index) => {
            card.pos = index
        })
        newBoard.lists[destinationListIndex].cards.forEach((card, index) => {
            card.pos = index
        })

        this.setState({board: newBoard})

        axios.put(url.api + 'card/' + result.draggableId + "/oldList/" + result.source.droppableId + "/newList/" + result.destination.droppableId + "/board/" + newBoard._id,
        {oldPos: result.source.index, newPos: result.destination.index},
        url.config)
        .then((response) => {
            this.socket.emit('updateBoardServer', newBoard)
        })
        .catch((error) => {
            alert('An error occured when getting the cards')
        })
    }

    render(){
        return(
            <div className='board'>
                {
                    this.state.pageLoaded ?(

                        <DragDropContext  onDragEnd={this.onDragEnd} >
                            <div className="boardContainer">
                                    {this.renderOptions()}
                                <div className="listContainer">
                                    {this.cardList(this.state.board.lists)}
                                    <div id="addListDiv">
                                        <FormControl type = "text" name = "titleNewList" value = {this.state.titleNewList} placeholder = "Add a list..."
                                            onChange = {this.handleInputChange} id="addListInput" onKeyPress={this.handleKeyPress}/>
                                        <div className="buttonsList">
                                            <Button bsStyle="success" className='addListButton' onClick={this.onClickAddList} disabled={this.state.titleNewList.trim().length < 1}>
                                                Add List
                                            </Button>
                                            {this.state.board.admins && this.state.board.admins.includes(Auth.getUserID())?(<Button bsStyle="primary" className='addListButton' onClick={() => this.setModalVisible(true)} >Board Options</Button>):(<span></span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </DragDropContext>
                    ):
                    (
                        <div className="spinn">
                            <Spin size='large' />
                        </div>
                    )
                }
            </div>


        )
    }

    addCard(card, listId){
        const listIndex=this.state.board.lists.findIndex(l=>l._id === listId)

        if (this.state.board.lists[listIndex]){
            let newCards = this.state.board.lists[listIndex].cards

            let newCard = card
            newCard.pos = newCards.length

            newCards.push(newCard)

            let newBoard = this.state.board

            newBoard.lists[listIndex].cards = newCards

            this.setState({board: newBoard})
        }
    }

    deleteCards(listId) {
        const listIndex=this.state.board.lists.findIndex(l=>l._id === listId)

        let newBoard = this.state.board

        if (newBoard.lists[listIndex]){
            newBoard.lists[listIndex].cards = []

            this.setState({board: newBoard})
        }
    }

    deleteCard(cardId, listId) {
        const listIndex = this.state.board.lists.findIndex(l=>l._id === listId)


        if (this.state.board.lists[listIndex]){
            const cardIndex = this.state.board.lists[listIndex].cards.findIndex(c=>c._id === cardId)

            let newBoard = this.state.board

            newBoard.lists[listIndex].cards.splice(cardIndex, 1)

            this.setState({board: newBoard})
        }
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (this.state.titleNewList) {
                this.onClickAddList()
            }
        }
    }

    handleInputChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }

    getAllLists(data){
        data.sort(function(a, b){ return a.pos - b.pos})
        data.forEach((list) => {
            list.cards.sort(function(a, b){ return a.pos - b.pos})
        })
        this.setState({board:{lists: data}})
    }

    onClickAddList(){
        axios.post(url.api + 'list/board/' + this.props.id, {
            title: this.state.titleNewList.trim(),
            pos: this.state.board.lists.length
        }, url.config).then((response) => {
            this.socket.emit('newList', response.data, this.props.id)
            this.createList(response.data, this.props.id)
        })
        .catch((error) => {
            handleServerResponse(error, 'An error occured when adding the lists')
        })
        this.setState({titleNewList: ""})
    }

    createList(newList, idBoard){
        if (idBoard === this.props.id){
            let newBoard = Object.assign({}, this.state.board, {lists:this.state.board.lists.concat(newList)})
            this.setState({board: newBoard})
        }
    }

    cardList(lists){
        const listItems= lists.map((list)=>
            <List key={list._id} parameters = {this.state.parameters} cards={list.cards} id={list._id} io={this.socket} title={list.title} usersBoard={this.state.usersBoard} idBoard={this.props.id} dbx={this.props.dbx} labelsBoard={this.state.board.labels}/>
        )
        return listItems
    }

    deleteList(listId) {
        let newBoard = this.state.board
        newBoard.lists = newBoard.lists.filter(list => list._id !== listId)
        this.setState( prevState => ({
          board: newBoard
        }))
    }

    renderOptions(){
        if(this.state.board.admins && this.state.board.admins.includes(Auth.getUserID())){
            return(
            <div className="optionsContainer">
                <Modal
                    title="Board Admin Options"
                    style={{ top: "10%" }}
                    visible={this.state.modalVisible}
                    onOk={() => this.setModalVisible(false)}
                    onCancel={() => this.setModalVisible(false)}
                    footer={null} >
                    <CascadeTeam teams={this.state.allTeams.filter(team=>!team.boards.includes(this.props.id))} boardId={this.props.id} remove={false} updateAllTeams={this.updateAllTeams}/>
                    <CascadeTeam teams={this.state.allTeams.filter(team=>team.boards.includes(this.props.id))} boardId={this.props.id} remove={true} updateAllTeams={this.updateAllTeams}/>
                    <Cascade users={this.state.usersBoard.filter(usr=>!this.state.board.admins.includes(usr._id))} task="Add Board Admin" boardId={this.state.board._id} updateBoard={this.updateBoard}/>
                    <Cascade users={this.state.users.filter(usr=>this.state.board.admins.includes(usr._id))} task="Revoke Board Admin" boardId={this.state.board._id} updateBoard={this.updateBoard}/>
                </Modal>
            </div>
            )
        }
    }

    updateAllTeams(team){
        let newAllTeams=this.state.allTeams.filter(t=>t._id!==team._id)
        this.setState({allTeams:newAllTeams.concat(team)})
    }

    updateBoard(board){
        this.setState({board: board})
    }

    setModalVisible(modalVisible) {
        this.setState({ modalVisible })
      }
}
export default Board