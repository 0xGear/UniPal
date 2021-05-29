import { Component } from "react"
import { List } from "./EventInfoCard"

import "./AssetInfoCard.scss"
import "../App.scss"

export default class AssetInfoCard extends Component{
    constructor(props){
        super(props)
        this.info = props.content
    }
    render(){
        return (
            <div className="assetinfocard">
                <div id="table_title">{this.props.title}</div>
                    <div id="list">
                        <List title="initial asset @ initial price" content={this.info.initAssetAtInitPrice}/>
                        <List title="initial asset @ current price" content={this.info.initAssetAtCurPrice}/>
                        <List title="current asset @ current price" content={this.info.curAssetAtCurPrice}/>
                    </div>

                    <div className="table34">
                        <div className="col sub-title">token</div>
                        <div className="col sub-title">initial / current amount</div>
                        <div className="col sub-title">amount variation</div>
                        <div className="col sub-title">initial / current price</div>
                        <div className="col sub-title">price variation</div>
                        <div className="col">{this.info.token0Str}</div>
                        <div className="col">{this.info.initAmount0+" / "+this.info.curAmount0}</div>
                        <div className="col">{this.info.amountVar0}</div>
                        <div className="col">{this.info.initPrice0+" / "+this.info.curPrice0}</div>
                        <div className="col">{this.info.priceVar0}</div>
                        <div className="col">{this.info.token1Str}</div>
                        <div className="col">{this.info.initAmount1+" / "+this.info.curAmount1}</div>
                        <div className="col">{this.info.amountVar1}</div>
                        <div className="col">{this.info.initPrice1+" / "+this.info.curPrice1}</div>
                        <div className="col">{this.info.priceVar1}</div>
                    </div>
                    <div id="sizealert">
                    For more info please resize the window to full screen width.
                    </div>
            </div>
        )
    }
}
