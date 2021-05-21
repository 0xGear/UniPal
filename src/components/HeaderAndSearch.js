import './HeaderAndSearch.scss'
import React,{Component} from 'react'
export default class HeaderAndSearch extends Component{
    constructor(props){
        super(props)
        this.state = props.state
        this.OnSearchClick = props.onsearchclick
        this.HandleChange = props.handlechange
        this.tkn_id= (this.state.tkn_id)? "token ID":this.state.tkn_id
    }

    

    render(){
        return(
            <div id="HS_container">
                <h1 className="logo-text">UniPal</h1>
                <p>Your best pal for <span>Uniswap V3</span> liquidity analysis</p>
                <div className="search-bar">
                    <input type="text" name="tkn_id" id="tkn_input" placeholder="token ID" onChange={this.HandleChange}/>
                    <input type="button" name="search" id="search_btn" value="search" onClick={this.OnSearchClick}/>
                </div>
            </div>
        )
    }
}