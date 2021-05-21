import React, {Component} from 'react'
import logo from './img/logo.svg'
import './NavBar.scss'

export default class NavBar extends Component{
    constructor(props){
        super(props)
    }
    render(){
        return(
            <div id="navbar_container">
                <img id="logo_img" src={logo} alt="UniPal logo"/>
                <div id="logo_text">UniPal</div>
            </div>
        )
    }
}