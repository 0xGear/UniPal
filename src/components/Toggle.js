import { Component } from "react"

import "./Toggle.scss"

export default class Toggle extends Component{
    constructor(props){
        super(props)
        console.log(this.props)
    }

    render(){
        return(
            <div className="switch">
                <input type="checkbox" onChange={this.props.changeHandler}></input>
                <span className="slider round"></span>
            </div>
        )
    }
}