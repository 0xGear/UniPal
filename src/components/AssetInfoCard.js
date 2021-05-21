import { Component } from "react"

import "./AssetInfoCard.scss"

export default class AssetInfoCard extends Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
            <div className="assetinfocard">
                <div id="table_title">{this.props.title}</div>
                    <div className="table42">
                        <div className="col0">{this.props.r0c0}</div>
                        <div className="col1">{this.props.r0c1}</div>
                        <div className="col0">{this.props.r1c0}</div>
                        <div className="col1">{this.props.r1c1}</div>
                        <div className="col0">{this.props.r2c0}</div>
                        <div className="col1">{this.props.r2c1}</div>
                        <div className="col0">{this.props.r3c0}</div>
                        <div className="col1">{this.props.r3c1}</div>
                    </div>
                    <div className="table34">
                        <div className="col0 sub-title">{this.props.r0c0_2}</div>
                        <div className="col1 sub-title">{this.props.r0c1_2}</div>
                        <div className="col2 sub-title">{this.props.r0c2_2}</div>
                        <div className="col3 sub-title">{this.props.r0c3_2}</div>
                        <div className="col0">{this.props.r1c0_2}</div>
                        <div className="col1">{this.props.r1c1_2}</div>
                        <div className="col2">{this.props.r1c2_2}</div>
                        <div className="col3">{this.props.r1c3_2}</div>
                        <div className="col0">{this.props.r2c0_2}</div>
                        <div className="col1">{this.props.r2c1_2}</div>
                        <div className="col2">{this.props.r2c2_2}</div>
                        <div className="col3">{this.props.r2c3_2}</div>
                    </div>
            </div>
        )
    }
}