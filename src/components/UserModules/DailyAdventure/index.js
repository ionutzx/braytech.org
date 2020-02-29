import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { orderBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as utils from '../../../utils/destinyUtils';

import './styles.css';

class DailyAdventure extends React.Component {
  render() {
    const { t, member } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    console.log(characterActivities[member.characterId].availableActivities.map(m => ({ name: manifest.DestinyActivityDefinition[m.activityHash].displayProperties.name, ...m })));

    return (
      <div className='user-module daily-adventure'>
        <div className='sub-header'>
          <div>{}</div>
        </div>
        <div className='text'>
          <p>
            <em>
              {/* {t('Revisit the trials of times past. Reconcile with these emotions and challenge yourself to do better.')} */}
            </em>
          </p>
        </div>
        <h4>{t('Available activities')}</h4>

      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(
    mapStateToProps
  ),
  withTranslation()
)(DailyAdventure);
