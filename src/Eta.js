import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames'

export default class Eta extends React.Component {

  static propTypes = {
    eta: PropTypes.string,
    dark: PropTypes.bool,
    label: PropTypes.string
  }

  static defaultProps = {
    eta: null
  }

  render() {
    const etaClass = classnames({
      'eta prose flex-child align-center viewport-half': true,
      'prose--dark bg-black': this.props.dark
    });

    const etaString = this.props.eta ? `${this.props.eta} Seconds` : '';

    return (
      <div className={etaClass}>
        <h1>{this.props.label}</h1>
        <h2>{etaString}</h2>
      </div>
    )
  }
}
