import React from 'react';
import List from './List.js';
import NavbarElem from './NavbarElem'
import NumberUser from './NumberUser'
import SocketIOClient from 'socket.io-client';

  class App extends React.Component{
    
    constructor(props){
      super(props)
      this.socket = SocketIOClient('http://localhost:8000');
    }

    render(){
      return(
        <div>
          <NavbarElem/>
          <NumberUser io={this.socket}/>
          <List io={this.socket}/>
        </div>
      );
    }
}

export default App;
