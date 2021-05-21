import { Component } from "react"

import "./BlackCard.scss"

export default class blackCard extends Component{
    constructor(props){
        super(props)
        this.title = props.title
        this.value = props.value
    }
    render(){
        return (
            <div className="blackcard">
                <div className="title">{this.title}</div>
                <div className="value">{this.value}</div>
            </div>
        )
    }
}