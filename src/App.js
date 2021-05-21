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
      search:false
    }
    this.OnSearchClick = this.OnSearchClick.bind(this)
    this.HandleChange = this.HandleChange.bind(this)
  }

  OnSearchClick=async()=>{
    //check valid toked id
    if(this.CheckTokenValid(this.state.value)){
      // find events
      //this.setState({search:true})
      // set refresh
      this.setState({tokenId:this.state.value})
    }
  }

  HandleChange=(e)=>{
    this.setState({
      value:e.target.value
    })
  }

  CheckTokenValid=(input)=>{
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
            handlechange={this.HandleChange}
            onsearchclick={this.OnSearchClick} 
            state={this.state}
          />
          <GrabData state={this.state} tokenId={this.state.tokenId}/>
        </div>
      );
    }
    else{
      return (
        <div className="App">
          <NavBar/>
          <HeaderAndSearch 
            handlechange={this.HandleChange}
            onsearchclick={this.OnSearchClick} 
            state={this.state}
          />
        </div>
      );
    }
    
  }
  
}


