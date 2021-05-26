import { Component } from "react"
import "./EventInfoCard.scss"

export default class EventInfoCard extends Component {

    constructor(props) {
        super(props)
        this.props = props
        this.tkninfo = props.state
        this.eventlists = props.state.eventLog
        let curAssetAtCurPrice = ((parseFloat(this.tkninfo.currentAmount0)*this.tkninfo.curPriceUsd0)+(parseFloat(this.tkninfo.currentAmount1)*this.tkninfo.curPriceUsd1)).toFixed(4)
        this.netgain_percentage = (((curAssetAtCurPrice-this.tkninfo.totalInput)/this.tkninfo.totalInput)*100).toFixed(4)+" %"
        this.netgain = (curAssetAtCurPrice-this.tkninfo.totalInput).toFixed(4)
        this.displayil = (Number(this.tkninfo.currentAmount0)+Number(this.tkninfo.currentAmount1)==0)? false:true
        this.il = (curAssetAtCurPrice - (Number(this.tkninfo.totalInputToken0)*this.tkninfo.curPriceUsd0+Number(this.tkninfo.totalInputToken1)*this.tkninfo.curPriceUsd1))
        console.log(props)
    }

    render() {
        if (this.eventlists) {
            return (
                <div className="eventinfocard">
                    <div id="table_title">{this.props.title}</div>
                    <div id="list">
                        
                        <List title="Gain from Market Price" content={"$ "+Number(Number(this.netgain).toFixed(4)).toLocaleString()+" ("+this.netgain_percentage+") "}/>  
                        {
                            (this.displayil) && <List title={"Impermanent lost"} content={"$ "+Number(Number(this.il).toFixed(4)).toLocaleString()}/>
                        }
                        <List title="Overall Investment" content={"$ "+Number(Number(this.tkninfo.totalInput).toFixed(4)).toLocaleString()}/>
                        {
                            (this.displayil) &&
                                <div>
                                    <List title={"Invested "+this.tkninfo.token0Str} content={Number(Number(this.tkninfo.totalInputToken0).toFixed(4)).toLocaleString()+" "+this.tkninfo.token0Str}/>
                                    <List title={"Current "+this.tkninfo.token0Str} content={Number(Number(this.tkninfo.currentAmount0).toFixed(4)).toLocaleString()+" "+this.tkninfo.token0Str}/>
                                    <List title={"Invested "+this.tkninfo.token1Str} content={Number(Number(this.tkninfo.totalInputToken1).toFixed(4)).toLocaleString()+" "+this.tkninfo.token1Str}/>
                                    <List title={"Current "+this.tkninfo.token1Str} content={Number(Number(this.tkninfo.currentAmount1).toFixed(4)).toLocaleString()+" "+this.tkninfo.token1Str}/>
                                    
                                </div>
                        }
                    </div>
                    
                    <div id="table">
                        <EventRow className="sub_title" time="time" event="event" asset="asset variation amount"  value="invest value"/>
                        {
                            this.eventlists.map((item, index) => {
                                let [month, date, year] = new Date(item.timestamp).toLocaleDateString("en-US").split("/")
                                let _date = item.year + "/" + item.month + "/" + item.date
                                let prefix = (item.event === "IncreaseLiquidity") ? "invest" : "withdraw"
                                let shortprefix = (item.event === "IncreaseLiquidity") ? "+" : "-"
                                return (
                                    <EventRow
                                    className="" 
                                    time={_date} 
                                    event={item.event}
                                    asset={shortprefix+" {"+this.tkninfo.token0Str+" "+Number(item.amount0).toFixed(4)+","+this.tkninfo.token1Str+" "+Number(item.amount1).toFixed(4)+"}"}
                                    value={prefix + "   $ " + Number(item.investment).toLocaleString()} hash={item.transactionHash} />
                                )
                            })
                        }
                    </div>
                    
                    <div id="sizealert">
                        For more info please resize the window to full screen width.
                    </div>
                    
                    <div id="text">
                        <p>* overall investment = SUM(invest value of each event)</p>
                        <p>* Gain from market price = (current asset @ current price) - (overall investment)</p>
                        <p>* IL calcualtion may not apply if you've extracted all liquidity for now (still working on it)</p>
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
                <div className="list-title">{this.props.title}</div>
                <div className="list-content">{this.props.content}</div>
            </div>
        )
    }
}