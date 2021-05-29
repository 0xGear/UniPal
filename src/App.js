import './App.scss';
import NavBar from './components/NavBar'
import HeaderAndSearch from './components/HeaderAndSearch'
import { Component } from 'react';
import GrabData from './tools/GrabData'
export default class App extends Component {
  constructor(props){
    super(props)
    //this.data = React.createRef()
    this.state = {
      tokenId:null,
      search:false,
    }
    this.onSearchClick = this.onSearchClick.bind(this)
    this.onSearchEnter = this.onSearchEnter.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  onSearchEnter=async(e)=>{
    //check valid toked id
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

  //check valid tkn_id

  render(){
    if (this.state.tokenId){
      return (
        <div className="App">
          <NavBar/>
          <HeaderAndSearch 
            handlechange={this.handleChange}
            onsearchclick={this.onSearchClick}
            onsearchenter={this.onSearchEnter} 
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
            handlechange={this.handleChange}
            onsearchclick={this.onSearchClick} 
            onsearchenter={this.onSearchEnter}
            state={this.state}
          />
        </div>
      );
    }
    
  }
  
}


