import React from 'react'
import { Button,FormGroup,FormControl, Nav, Navbar, NavItem, Image} from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import Auth from '../Auth/Auth.js'

class Header extends React.Component{
  constructor(props){
    super(props)
    this.state = {
        search: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange = (e) => {
      this.setState({[e.target.name]: e.target.value})
  }

  render(){
    const guestNavbar = (
      <Navbar className="navbar-fixed-top" responsive='true' collapseable='true'>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">
              <LinkContainer to="/" className="logo">
                <Image src="/favicon.ico" alt="Prello mascot"/>
              </LinkContainer> 
              <span id="prelloHeaderTitle">Prello</span>
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
          {Auth.isUserAuthenticated() ?
          (
            <Navbar.Collapse>
              <Nav pullRight>
                <NavItem>
                  {Auth.getNickname()}
                </NavItem>
                <LinkContainer to="/login" onClick={Auth.deauthenticateUser}>
                  <NavItem>
                    Log Out
                  </NavItem>
                </LinkContainer>
              </Nav>
              <Navbar.Form pullRight>
                <FormGroup>
                  <FormControl type="text" placeholder="Search" name="search" onChange={this.handleInputChange}
                    onKeyPress=
                      {(e) => {if(e.key==='Enter' && e.target.value.trim().length > 0) window.location = "/search/"+this.state.search}}
                    />
                </FormGroup>
                <Button type="submit"
                  onClick={() => window.location = "/search/"+this.state.search}
                  disabled={this.state.search.trim().length < 1}>
                  Search
                </Button>
              </Navbar.Form>
            </Navbar.Collapse>
          ):
            (
              <Navbar.Collapse>
              <Nav pullRight>
                <LinkContainer to="/login">
                  <NavItem>
                    Login
                  </NavItem>
                </LinkContainer>
                <LinkContainer to="/register">
                  <NavItem>
                    Register
                  </NavItem>
                </LinkContainer>
              </Nav>
        </Navbar.Collapse>
          )
          }
      </Navbar>
    )

    return(
      <div className="headerMenu">{guestNavbar}</div>
    )}
  }

export default Header
