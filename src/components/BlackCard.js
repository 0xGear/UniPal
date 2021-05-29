import { Component } from "react"

import "./BlackCard.scss"

export default class blackCard extends Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
            <>
            <div className="blackcard">
                <div className="title">{this.props.title}
                {
                (this.props.help) &&
                <div className="tooltip">{this.props.help}</div>
                }
                </div>
                <div className="value">{this.props.value}</div>
            </div>
            </>
        )
    }
}