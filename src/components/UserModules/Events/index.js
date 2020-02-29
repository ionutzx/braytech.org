import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import { ReactComponent as EventsTheDawning } from '../../../svg/events/the-dawning.svg';

import './styles.css';

class Events extends React.Component {
  render() {
    const { t, member } = this.props;

    return (
      <div className='user-module event'>
        <div className='sub-header'>
          <div>{t('Event')}</div>
        </div>
        <div className='icon the-dawning'>
          <EventsTheDawning />
        </div>
        <div className='layout'>
          <div className='name'>The Dawning</div>
          <div className='description'>
            <p>The Dawning is a special time when brave Guardians spread cheer (and cookie crumbs) throughout the solar system while keeping the Darkness at bay. This year, Eva Levante returns to share tidings of joy and merriment with friends, new and old.</p>
            <p>It might be cold on the Moon, but the lanterns that deck the halls keep the Tower warm and toasty. Gather and celebrate your victories, Guardian. The season for thanks is upon us.</p>
          </div>
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

export default compose(connect(mapStateToProps), withTranslation())(Events);
