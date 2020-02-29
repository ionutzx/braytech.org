import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import manifest from '../../../utils/manifest';

import './styles.css';

class BlackArmoryForges extends React.Component {
  render() {
    const { t, member } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    const dailyBlackArmoryForges = characterActivities[member.characterId].availableActivities.filter(a => {
      const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

      if (definitionActivity && definitionActivity.activityTypeHash === 838603889) {
        return true;
      } else {
        return false;
      }
    });

    return (
      <div className='user-module black-armory-forges'>
        <div className='sub-header'>
          <div>{t('Black Armory Forges')}</div>
        </div>
        <div className='text'>
          <p>
            <em>{t('Forges are currently running in low-power mode and will only be available during maintenance periods.')}</em>
          </p>
        </div>
        <h4>{t('Available activities')}</h4>
        {dailyBlackArmoryForges.length ? (
          <ul className='list activities'>
            {dailyBlackArmoryForges.map((a, i) => {
              const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

              return (
                <li key={i} className='linked tooltip' data-table='DestinyActivityDefinition' data-hash={a.activityHash}>
                  <div className='name'>{definitionActivity.selectionScreenDisplayProperties && definitionActivity.selectionScreenDisplayProperties.name ? definitionActivity.selectionScreenDisplayProperties.name : definitionActivity.displayProperties && definitionActivity.displayProperties.name ? definitionActivity.displayProperties.name : t('Unknown')}</div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className='info'>
            {t("There aren't any activities available to you. Perhaps you don't meet the requirements...")}
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(connect(mapStateToProps), withTranslation())(BlackArmoryForges);
