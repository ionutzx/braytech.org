import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { groupBy, orderBy } from 'lodash';
import cx from 'classnames';

import * as enums from '../../../utils/destinyEnums';
import manifest from '../../../utils/manifest';
import ProgressBar from '../../UI/ProgressBar';
import { recallMissions } from '../Luna';

import './styles.css';

const groups = [
  [
    2498962144, // Nightfall: The Ordeal with a team score above 100,000.
    2443315975  // Nightfall: The Ordeal activities completion
  ],
  [
    3118376466, // Crucible core playlists
    1607758693  // Crucible Rotator playlists
  ],
  [
    3683641566, // Nightmare Hunt activities completion
    2190387136  // Nightmare Hunt on Master difficulty
  ]
];

class Challenges extends React.Component {
  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getOverrides = (objectiveHash, activityHash) => {
    if (objectiveHash === 3683641566) {
      return {
        name: this.props.t('Nightmare Hunts'),
        description: this.props.t('Your most feared, devastating, tormenting nightmares reincarnate―be immovable in your resolve, Guardian.')
      };
    } else if (objectiveHash === 2443315975 || objectiveHash === 2498962144) { // Nightfall: The Ordeal
      return {
        description: this.props.t('Undertake your most perilous albeit rewarding strikes yet, in the name of the Light, the Vanguard, and The Last City.')
      };
    } else if (objectiveHash === 1296970487) {
      return {
        name: manifest.DestinyObjectiveDefinition[1296970487]?.displayProperties.name,
        description: this.props.t('Retrace your steps and unravel the mystery of the Pyramid.')
      };
    } else if (objectiveHash === 3118376466 || objectiveHash === 1607758693) { // Crucible
      return {
        name: manifest.DestinyPlaceDefinition[4088006058].displayProperties.name,
        description: manifest.DestinyPlaceDefinition[4088006058].displayProperties.description
      };
    }
  };

  isLunasRecall = activityHash => recallMissions.indexOf(activityHash) > -1;
  isNightmareHunt = activityHash => enums.nightmareHunts.find(n => n.activities.indexOf(activityHash) > -1);
  isNightfallOrdeal = activityHash => Object.values(enums.nightfalls).find(n => n.ordealHashes.indexOf(activityHash) > -1);
  isDungeon = activityHash => manifest.DestinyActivityDefinition[activityHash]?.activityTypeHash === 608898761;
  isRaid = activityHash => manifest.DestinyActivityDefinition[activityHash]?.activityTypeHash === 2043403989;

  getActivities = activities => {
    if (this.isNightmareHunt(activities[0]) || this.isNightfallOrdeal(activities[0])) {
      return activities.filter(activityHash => manifest.DestinyActivityDefinition[activityHash].activityLightLevel > 950);
    } else if (this.isLunasRecall(activities[0]) || this.isDungeon(activities[0]) || this.isRaid(activities[0])) {
      return activities;
    } else {
      return [];
    }
  };

  render() {
    const { t, member } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    // console.log(groupBy(characterActivities[member.characterId].availableActivities.filter(a => a.challenges), a => a.challenges[0].objective.objectiveHash))

    const challenges = characterActivities[member.characterId].availableActivities
      .filter(a => a.challenges)
      .reduce((a, v) => [...a, ...(v.challenges.filter(c => !a.filter(b => b.objectiveHash === c.objective.objectiveHash).length).map(c => c.objective) || [])], [])
      .reduce((a, v) => {
        const group = groups.find(g => g.indexOf(v.objectiveHash) > -1);

        if (group) {
          const indexOf = a.findIndex(g => g.objectives.filter(h => group.indexOf(h.objectiveHash) > -1).length);

          if (indexOf > -1) {
            a[indexOf].objectives = [...a[indexOf].objectives, v];

            // potential to-do: this code only knows how to collate objectives
            // currently, only nightfall: the ordeal has more than one objective and each activity has the same objectives

            return a;
          } else {
            return [
              ...a,
              {
                activityHash: v.activityHash,
                activities: characterActivities[member.characterId].availableActivities
                  .filter(a => a.challenges)
                  .filter(a => a.challenges.filter(o => o.objective.objectiveHash === v.objectiveHash).length)
                  .map(a => a.activityHash),
                objectives: [v]
              }
            ];
          }
        } else {
          return [
            ...a,
            {
              activityHash: v.activityHash,
              activities: characterActivities[member.characterId].availableActivities
                .filter(a => a.challenges)
                .filter(a => a.challenges.filter(o => o.objective.objectiveHash === v.objectiveHash).length)
                .map(a => a.activityHash),
              objectives: [v]
            }
          ];
        }
      }, []);

    console.log(challenges);

    return (
      <div className='user-module challenges'>
        <div className='sub-header'>
          <div>{t('Challenges')}</div>
        </div>
        <ul>
          {challenges.filter(a => a.objectives.filter(o => !o.complete).length).length ? (
            challenges
              .filter(a => a.objectives.filter(o => !o.complete).length)
              .map((challenge, i) => {
                const override = this.getOverrides(challenge.objectives[0]?.objectiveHash, challenge.activityHash);
                const activities = this.getActivities(challenge.activities);

                const name = override?.name || manifest.DestinyActivityDefinition[challenge.activityHash].originalDisplayProperties?.name || manifest.DestinyActivityDefinition[challenge.activityHash].displayProperties.name;
                const description = override?.description || manifest.DestinyActivityDefinition[challenge.activityHash].originalDisplayProperties?.description || manifest.DestinyActivityDefinition[challenge.activityHash].displayProperties.description;

                return (
                  <li key={i}>
                    <div className='activity'>
                      <div className='text'>
                        <div className='name'>{name}</div>
                        <div className='description'>
                          <p>{description}</p>
                        </div>
                      </div>
                      {activities.length ? (
                        <>
                          <h4>{t('Available activities')}</h4>
                          <ul className='list activities'>
                            {activities.map((activityHash, i) => {
                              const definitionActivity = manifest.DestinyActivityDefinition[activityHash];

                              const name = this.isNightfallOrdeal(activityHash) ? definitionActivity.originalDisplayProperties.description : definitionActivity.originalDisplayProperties?.name.replace('Nightmare Hunt: ', '') || definitionActivity.displayProperties.name;

                              return (
                                <li key={i} className='linked tooltip' data-table='DestinyActivityDefinition' data-hash={definitionActivity.hash} data-mode={definitionActivity.directActivityModeHash}>
                                  <div className='name'>{name}</div>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      ) : null}
                    </div>
                    <div className={cx('challenges', { completed: !challenge.objectives.filter(o => !o.complete).length })}>
                      {challenge.objectives.map((objective, o) => {
                        const rewards = manifest.DestinyActivityDefinition[objective.activityHash].challenges?.find(c => c.objectiveHash === objective.objectiveHash)?.dummyRewards || [];

                        return (
                          <div key={o} className='challenge'>
                            <div className='objective'>
                              <div className='text'>
                                <p>{manifest.DestinyObjectiveDefinition[objective.objectiveHash].displayProperties.description}</p>
                              </div>
                              <ProgressBar key={o} {...objective} />
                              {/* <p>{objective.objectiveHash}</p> */}
                            </div>
                            {rewards.length ? (
                              <div className={cx('rewards', { pinnacle: rewards.filter(r => r.itemHash === 73143230).length })}>
                                {rewards.map(r => manifest.DestinyInventoryItemDefinition[r.itemHash]?.displayProperties.name).join(', ')}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })
          ) : (
            <div className='info'>{t('It seems your Guardian has smashed all of their challenges this week.')}</div>
          )}
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

export default compose(connect(mapStateToProps), withTranslation())(Challenges);
