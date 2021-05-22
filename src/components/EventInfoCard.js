import { Component } from "react"
import "./EventInfoCard.scss"

export default class EventInfoCard extends Component{

    constructor(props){
        super(props)
        this.props = props
        this.eventlists = props.events
        console.log(props)
    }

    render(){
        if(this.eventlists){
            return(
            <div className="eventinfocard">
                <div id="table_title">{this.props.title}</div>
                <div id="table">
                {
                    this.eventlists.map((item,index) => {
                        let [month, date, year] = new Date(item.timestamp).toLocaleDateString("en-US").split("/")
                        let _date = item.year+"/"+item.month+"/"+item.date
                        let prefix = (item.event==="IncreaseLiquidity")? "invest" : "withdraw"
                    return (
                        <Row time={_date} event={item.event} value={prefix+"   $ "+Number(item.investment).toLocaleString()} hash={item.transactionHash}/>
                    )
                })
                }
                </div>
            </div>
        )
        }
        
    }
}

export class Row extends Component{
    constructor(props){
        super(props)
        this.props = props
    }
    render(){
        return(
            <div className="row">
                <div className="time">{this.props.time}</div>
                <div className="event">{this.props.event}</div>
                <div className="value">{this.props.value}</div>
            </div>
        )
    }
}