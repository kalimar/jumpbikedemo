import React from 'react';
import IconClose from './IconClose.js';
import IconInfoCircle from './IconInfoCircle.js';

export default class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    }
  }

  render() {
    if (this.state.showModal) {
      return (
        <div id="info-modal" class='flex-child bg-white round relative w600'>
          <button class='absolute top right px12 py12' onClick={_ => this.setState({showModal: false})}>
            <IconClose/>
          </button>
          <div class='px24 py24'>
            <div class='txt-l mb12'>JUMP Bikes vs Cars</div>
            <div class='txt-m prose'>
              <p>
                This project is intended to be a whimsical visualization of <a href="https://jumpbikes.com/" target="_blank">JUMP</a> Bike Routes which were identified as faster than car routes from data
                provided by JUMP. The data was anonymized by truncating the coordinates to three decimal places. This moves the points by approximately
                100 meters (328 feet).
              </p>
              <p>
                In the future we would like to collect more data and create a more complete visualization that compares JUMP routes to car routes
                at particular times through out the day.
              </p>
              <p>
                A big thank you to <a href="https://twitter.com/NellePierson" target="_blank">Nelle</a> for the data and to the&nbsp;
                <a href="https://www.meetup.com/Transportation-Techies" target="_blank">Transportation Techies</a> for the opportunity to share with so many people.
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div onClick={_ => this.setState({showModal: true})} class="icon-wrapper">
          <IconInfoCircle />
        </div>
      )
    }
  }
}
