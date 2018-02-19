import React, { Component } from 'react';
import './App.css';
import Eta from './Eta.js';
import Map from './Map.js';
import Info from './Info.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eta: {
        jump: null,
        car: null
      }
    }
  }

  setEtaState = eta => {
    const {jump, car} = eta;
    this.setState({eta: {jump, car}});
  }

  render() {
    const etasWrapperClassName = "etas-wrapper flex-child w-full w240-ml absolute static-ml right bottom flex-parent--column flex-parent--center-main"
    return (
      <div className="App flex-parent viewport-full relative scroll-hidden flex-parent--center-main">
        <Info/>
        <Map setEta={this.setEtaState}/>
         <div className={etasWrapperClassName}>
          <Eta eta={this.state.eta.jump} dark label="JUMP" />
          <Eta eta={this.state.eta.car} label="Car" />
        </div>
      </div>
    );
  }
}

export default App;
