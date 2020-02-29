import React from 'react';
import { connect } from 'react-redux';
import { orderBy } from 'lodash';
import cx from 'classnames';

import { t, duration } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';
import * as utils from '../../../utils/destinyUtils';

import './styles.css';

class DailyHeroicStoryMissions extends React.Component {
  render() {
    const { member } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    const knownStoryActivities = [129918239, 271962655, 589157009, 1023966646, 1070049743, 1132291813, 1259766043, 1313648352, 1513386090, 1534123682, 1602328239, 1872813880, 1882259272, 1906514856, 2000185095, 2146977720, 2568845238, 2660895412, 2772894447, 2776154899, 3008658049, 3205547455, 3271773240, 4009655461, 4234327344, 4237009519, 4244464899, 2962137994];
    const dailyHeroicStoryActivities = characterActivities[member.characterId].availableActivities.filter(a => {
      if (!a.activityHash) return false;

      if (!knownStoryActivities.includes(a.activityHash)) return false;

      return true;
    });
    const dailyHeroicStories = {
      activities: dailyHeroicStoryActivities,
      displayProperties: {
        name: manifest.DestinyPresentationNodeDefinition[3028486709] && manifest.DestinyPresentationNodeDefinition[3028486709].displayProperties && manifest.DestinyPresentationNodeDefinition[3028486709].displayProperties.name
      }
    };

    return (
      <div className='user-module heroic-story-missions'>
        <div className='sub-header'>
          <div>{dailyHeroicStories.displayProperties.name}</div>
        </div>
        <div className='text'>
          <p>
            <em>{t('Revisit the trials of times past. Reconcile with these emotions and challenge yourself to do better.')}</em>
          </p>
        </div>
        <h4>{t('Available activities')}</h4>
        <ul className='list activities'>
          {orderBy(
            dailyHeroicStories.activities.map((a, i) => {
              const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

              const gameVersion = definitionActivity.eligibilityRequirements && utils.gameVersion(false, definitionActivity.eligibilityRequirements.gameVersion);

              return {
                light: definitionActivity.activityLightLevel,
                timeToComplete: definitionActivity.timeToComplete || 0,
                el: (
                  <li key={i} className={cx('linked', 'tooltip', { [gameVersion.hash]: gameVersion.hash !== 'base' })} data-table='DestinyActivityDefinition' data-hash={a.activityHash} data-mode='175275639'>
                    <div className='name'>{definitionActivity.selectionScreenDisplayProperties && definitionActivity.selectionScreenDisplayProperties.name ? definitionActivity.selectionScreenDisplayProperties.name : definitionActivity.displayProperties && definitionActivity.displayProperties.name ? definitionActivity.displayProperties.name : t('Unknown')}</div>
                    <div>
                      {gameVersion.hash !== 'base' && gameVersion.displayProperties.icon ? (
                        <div className='game-version-icon'>
                          <span className={gameVersion.displayProperties.icon} />
                        </div>
                      ) : null}
                      <div className='time'>{definitionActivity.timeToComplete ? <>{duration({ minutes: definitionActivity.timeToComplete || 0 }, { unit: 'minutes', abbreviated: true })}</> : null}</div>
                    </div>
                  </li>
                )
              };
            }),
            [m => m.timeToComplete],
            ['asc']
          ).map(e => e.el)}
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(DailyHeroicStoryMissions);
