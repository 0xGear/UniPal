import { Component } from "react"
import "./EventInfoCard.scss"

export default class EventInfoCard extends Component {

    constructor(props) {
        super(props)
        this.state={}
        this.assetInfo = props.assetInfo
        this.eventLists = props.assetInfo.eventList
    }

    render() {
        let prefix = (this.assetInfo.extracted)? "Final ":"Current "
        if (this.eventLists) {
            return (
                <div className="eventinfocard">
                    <div id="table-title">{this.props.title}</div>
                    <div id="list">
                        {
                            (this.extracted)&&
                            <div id="extract-alert">
                                You've extracted all your liquidity, all calculation will base on the final extracted value
                            </div>
                        }
                        <List title="Gain from Market Price (held in USD)" content={this.assetInfo.marketGain} help="all invested/removed tokens accumulated in USD price @ the exact operation moment"/>  
                        <List title="Gain from Market Price (held in token)" content={this.assetInfo.marketGainInTkn} help="all invested/removed tokens calculate with USD @ current price"/>  
                        <List title={"Impermanent loss"} content={this.assetInfo.IL}/>
                        <List title={"Overall Invested "+" / "+prefix+" Assets in USD Value"} content={"$ "+this.assetInfo.totalInputUSD+" / "+this.assetInfo.finalAmountUSD}/>
                        <List title={"Invested "+" / "+prefix+this.assetInfo.token0Str} content={this.assetInfo.totalInput0+" / "+this.assetInfo.finalAmount0+" "+this.assetInfo.token0Str}/>
                        <List title={"Invested "+" / "+prefix+this.assetInfo.token1Str} content={this.assetInfo.totalInput1+" / "+this.assetInfo.finalAmount1+" "+this.assetInfo.token1Str}/>
                    </div>
                    
                    <div id="table">
                        <EventRow className="sub-title" time="time" event="event" asset="asset variation amount"  value="invest value"/>
                        {
                            this.eventLists.map((item, index) => {
                                let date = item.year + "/" + item.month + "/" + item.date
                                let prefix = (item.event === "IncreaseLiquidity") ? "invest" : "withdraw"
                                let shortprefix = (item.event === "IncreaseLiquidity") ? "+" : "-"
                                return (
                                    <EventRow
                                    className="" 
                                    time={date} 
                                    event={item.event}
                                    asset={shortprefix+" {"+this.assetInfo.token0Str+" "+Number(item.amount0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+","+this.assetInfo.token1Str+" "+Number(item.amount1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+"}"}
                                    value={prefix + "   $ " + Number(item.investment).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})} hash={item.transactionHash} />
                                )
                            })
                        }
                        <EventRow time="overall" event="-" 
                            asset={" {"+this.assetInfo.token0Str+" "+this.assetInfo.overAllInput0+","+this.assetInfo.token1Str+" "+this.assetInfo.overAllInput1+"}"}
                            value={"$ "+this.assetInfo.overAllInputUSD}/>
                    </div>
                    
                    <div id="size-alert">
                        For more info please resize the window to full screen width.
                    </div>
                    
                    <div id="text">
                        <p>* IL = (current asset @ current price) - (invested asset @ current price)</p>
                    </div>
                </div>
            )
        }

    }
}

export class EventRow extends Component {
    constructor(props) {
        super(props)
        this.props = props
    }
    render() {
        return (
            <div className={"row"+" "+this.props.className}>
                <div className="time">{this.props.time}</div>
                <div className="event">{this.props.event}</div>
                <div className="asset">{this.props.asset}</div>
                <div className="value">{this.props.value}</div>
            </div>
        )
    }
}

export class List extends Component{
    constructor(props){
        super(props)
        this.props = props
    }
    render(){
        return(
            <div className="list">
                <div className="list-title">{this.props.title}
                {
                    (this.props.help) &&
                    <div className="tooltip">{this.props.help}</div>
                }
                </div>
                <div className="list-content alignright">{this.props.content}</div>
            </div>
        )
    }
}