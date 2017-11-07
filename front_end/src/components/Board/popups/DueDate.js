import React from 'react'
import {Button} from 'react-bootstrap'
import DateTime from 'react-datetime'
import axios from 'axios'
import url from '../../../config'

import './reactDateTime.css'

class DueDate extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            popup: this.props.popup,
            card: this.props.card,
            dueDate: this.props.dueDate
        }

        this.socket = this.props.io
        this.onClickUpdateDueDate = this.onClickUpdateDueDate.bind(this)
        this.updateCard = this.updateCard.bind(this)
    }
    
    render(){
        const timeCons = {minutes: {step: 30}}
        const yesterday = DateTime.moment().subtract( 1, 'day' )
        const valid = function( current ){
            return current.isAfter( yesterday )
        };
        return(
            <div className="dueDate">
                <hr/>
                <DateTime
                    value={this.state.dueDate}
                    className="inputDateTime"
                    onChange={param => { this.setState({dueDate: param._d})} }
                    viewMode= 'days'
                    dateFormat= 'LL'
                    timeFormat= 'HH:mm'
                    input= {true}
                    utc= {true}
                    timeConstraints= {timeCons}
                    isValidDate={valid}
                />
                <Button disabled={undefined === this.state.dueDate} className='dueDateButton' bsStyle="primary" onClick={this.onClickUpdateDueDate}>Add</Button>
            </div>
        )
    }

    onClickUpdateDueDate = (e) => {
        axios.put(url.api + 'card/' + this.props.card.state.cardInfos._id, {
            dueDate : this.state.dueDate,
            doneDate : null
        }).then((response) => {
            this.socket.emit('updateCardServer', response.data)
            this.updateCard(response.data)
        })
        .catch((error) => {
            alert('An error occured when updating the list')
        })
    }

    updateCard(card){
        if (card._id === this.props.card.state.cardInfos._id){
            let newCardInfos = this.state.card.state.cardInfos
            newCardInfos.dueDate = this.state.dueDate
            this.state.card.setState({cardInfos: newCardInfos})
            this.state.popup.setState({cardInfos: newCardInfos})
            this.setState({dueDate: card.dueDate})
        }
    }

}

export default DueDate
