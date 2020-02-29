import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { t, duration } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';

import './styles.css';

class SeasonCountdown extends React.Component {
  state = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  calculateTime = () => {
    const profile = this.props.member.data.profile.profile.data;
    const definitionSeason = manifest.DestinySeasonDefinition[profile.currentSeasonHash];

    const then = moment(definitionSeason.endDate);
    const now = moment();

    const distance = moment(then - now).unix() * 1000;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (this.mounted) this.setState({ days, hours, minutes, seconds });
  };

  componentDidMount() {
    this.mounted = true;

    if (this.mounted) {
      this.calculateTime();
      
      this.interval = setInterval(this.calculateTime, 1000)
    };
  }

  componentWillUnmount() {
    this.mounted = false;

    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const profile = this.props.member.data.profile.profile.data;
    const definitionSeason = manifest.DestinySeasonDefinition[profile.currentSeasonHash];

    return (
      <div className='user-module season-countdown'>
        <div className='sub-header'>
          <div>{t('Season countdown')}</div>
        </div>
        <div className='text'>
          <p>
            <em>{t('Time until {{eventName}} ends and change comes', { eventName: definitionSeason.displayProperties.name })}</em>
          </p>
        </div>
        <div className='time'>
          <div className='line' />
          <div className='text'>{duration(this.state)}</div>
          <div className='line' />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(SeasonCountdown);
