import { Component } from "react"
import "./EventInfoCard.scss"

export default class EventInfoCard extends Component {

    constructor(props) {
        super(props)
        this.props = props
        this.tkninfo = props.state
        this.eventlists = props.state.eventLog
        let curAssetAtCurPrice = (parseFloat(this.tkninfo.currentAmount0)*this.tkninfo.curPriceUsd0)+(parseFloat(this.tkninfo.currentAmount1)*this.tkninfo.curPriceUsd1)
        this.netgain_percentage = (((curAssetAtCurPrice-this.tkninfo.totalInput)/this.tkninfo.totalInput)*100).toFixed(4)+" %"
        this.netgain = (curAssetAtCurPrice-this.tkninfo.totalInput).toFixed(4)
        this.displayil = (Number(this.tkninfo.currentAmount0)+Number(this.tkninfo.currentAmount1)==0)? false:true
        this.il = (curAssetAtCurPrice - (Number(this.tkninfo.totalInputToken0)*this.tkninfo.curPriceUsd0+Number(this.tkninfo.totalInputToken1)*this.tkninfo.curPriceUsd1))
        this.extracted = (Number(this.tkninfo.currentAmount0)+Number(this.tkninfo.currentAmount1) === 0)? true:false 
        this.finalAmount0 = (this.extracted)? this.tkninfo.lastDecreaseToken0 : Number(this.tkninfo.currentAmount0)
        this.finalAmount1 = (this.extracted)? this.tkninfo.lastDecreaseToken1 : Number(this.tkninfo.currentAmount1)
        this.totalInput0 = (this.extracted)? this.tkninfo.totalInputToken0+this.tkninfo.lastDecreaseToken0 :this.tkninfo.totalInputToken0
        this.totalInput1 = (this.extracted)? this.tkninfo.totalInputToken1+this.tkninfo.lastDecreaseToken1 :this.tkninfo.totalInputToken1
        this.totalInputUSD = (this.extracted)? this.tkninfo.totalInput+this.tkninfo.lastDecrease : this.tkninfo.totalInput
        this.finalAmountUSD = (this.extracted)? this.tkninfo.lastDecrease: curAssetAtCurPrice
        console.log(props)
    }

    render() {
        let prefix = (this.extracted)? "Final ":"Current "
        if (this.eventlists) {
            return (
                <div className="eventinfocard">
                    <div id="table_title">{this.props.title}</div>
                    <div id="list">
                        {
                            (this.extracted)&&
                            <div id="extractalert">
                                You've extracted all your liquidity, all calculation will base on the final extracted value
                            </div>
                        }
                        
                        
                        <List title="Gain from Market Price (held in USD)" content={this.props.assetInfo.marketGain} help="all invested/removed tokens accumulated in USD price @ the exact operation moment"/>  
                        <List title="Gain from Market Price (held in token)" content={this.props.assetInfo.marketGainInTkn} help="all invested/removed tokens calculate with USD @ current price"/>  
                        {/*
                            (this.displayil) && <List title={"Impermanent losts"} content={"$ "+Number(this.il).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})}/>
                        */}
                        <List title={"Impermanent loss"} content={this.props.assetInfo.IL}/>
                        <List title={"Overall Invested "+" / "+prefix+" Assets in USD Value"} content={"$ "+Number(this.totalInputUSD).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+" / "+Number(this.finalAmountUSD).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})}/>
                        <List title={"Invested "+" / "+prefix+this.tkninfo.token0Str} content={Number(this.totalInput0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+" / "+Number(this.finalAmount0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+" "+this.tkninfo.token0Str}/>
                        <List title={"Invested "+" / "+prefix+this.tkninfo.token1Str} content={Number(this.totalInput1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+" / "+Number(this.finalAmount1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+" "+this.tkninfo.token1Str}/>
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
                                    asset={shortprefix+" {"+this.tkninfo.token0Str+" "+Number(item.amount0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+","+this.tkninfo.token1Str+" "+Number(item.amount1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+"}"}
                                    value={prefix + "   $ " + Number(item.investment).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})} hash={item.transactionHash} />
                                )
                            })
                        }
                        <EventRow time="overall" event="-" 
                            asset={" {"+this.tkninfo.token0Str+" "+Number(this.tkninfo.totalInputToken0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+","+this.tkninfo.token1Str+" "+Number(this.tkninfo.totalInputToken1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+"}"}
                            value={"$ "+this.tkninfo.totalInput.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})}/>
                    </div>
                    
                    <div id="sizealert">
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