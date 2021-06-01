import './App.scss';
import NavBar from './components/NavBar'
import HeaderAndSearch from './components/HeaderAndSearch'
import { Component } from 'react';
import GrabData from './tools/GrabData'
export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      tokenId:null,
      search:false,
    }
    this.onSearchClick = this.onSearchClick.bind(this)
    this.onSearchEnter = this.onSearchEnter.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  onSearchEnter=async(e)=>{
    if(e.key === "Enter"){
      if(this.checkTokenValid(this.state.value)){
        this.setState({
          tokenId:this.state.value,
        })
      }
    }
    
  }

  onSearchClick=async()=>{
    if(this.checkTokenValid(this.state.value)){
      this.setState({
        tokenId:this.state.value,
      })
    }
  }

  handleChange=(e)=>{
    this.setState({
      value:e.target.value
    })
  }

  checkTokenValid=(input)=>{
    if(isNaN(input)){
      alert("hey! input valid token id plz")
      return false
    }
    return true
  }

  render(){
    if (this.state.tokenId){
      return (
        <div className="App">
          <NavBar/>
          <HeaderAndSearch 
            handleChange={this.handleChange}
            onSearchClick={this.onSearchClick}
            onSearchEnter={this.onSearchEnter} 
            state={this.state}
          />
          <GrabData state={this.state}/>
        </div>
      );
    }
    else{
      return (
        <div className="App">
          <NavBar/>
          <HeaderAndSearch 
            handleChange={this.handleChange}
            onSearchClick={this.onSearchClick} 
            onSearchEnter={this.onSearchEnter}
            state={this.state}
          />
        </div>
      );
    }
    
  }
  
}


