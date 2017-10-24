import React from 'react'
import Board from './Board'
import SocketIOClient from 'socket.io-client'

class HomeBoard extends React.Component{
    
    constructor(props){
      super(props)
      this.socket = SocketIOClient('http://localhost:8000');
    }

    render(){
      const address = JSON.stringify(this.props.location.pathname)
      const id = address.substring(address.lastIndexOf("/") + 1, address.length-1)

      return(
        <div>
          <Board io={this.socket} id={id}/>
        </div>
      ) 
    }
}


export default HomeBoard