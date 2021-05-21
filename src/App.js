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
    this.handleChange = this.handleChange.bind(this)
  }

  onSearchClick=async()=>{
    //check valid toked id
    if(this.checkTokenValid(this.state.value)){
      // find events
      //this.setState({search:true})
      // set refresh
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
            state={this.state}
          />
        </div>
      );
    }
    
  }
  
}


