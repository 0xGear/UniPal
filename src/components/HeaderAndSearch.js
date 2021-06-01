import './HeaderAndSearch.scss'
import React,{Component} from 'react'
export default class HeaderAndSearch extends Component{
    constructor(props){
        super(props)
        this.state = props.state
        this.onSearchClick = props.onSearchClick
        this.onSearchEnter = props.onSearchEnter
        this.handleChange = props.handleChange
    }

    render(){
        return(
            <div id="headerandsearch-container">
                <h1 className="logo-text">UniPal</h1>
                <p>Your best pal for <span>Uniswap V3</span> liquidity analysis</p>
                <div className="search-bar">
                    <input type="text" name="tkn_id" id="tkn-input" placeholder="Uniswap-v3 Pool/NFT ID" onChange={this.handleChange} onKeyDown={this.onSearchEnter}/>
                    <input type="button" name="search" id="search-btn" value="search" onClick={this.onSearchClick} />
                </div>
            </div>
        )
    }
}