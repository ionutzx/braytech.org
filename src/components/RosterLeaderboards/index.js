import React from 'react';
import { connect } from 'react-redux';
import { orderBy } from 'lodash';
import cx from 'classnames';
import moment from 'moment';

import { t, duration } from '../../utils/i18n';
import manifest from '../../utils/manifest';
import * as bungie from '../../utils/bungie';
import getGroupMembers from '../../utils/getGroupMembers';
import { ProfileNavLink, ProfileLink } from '../ProfileLink';
import MemberLink from '../MemberLink';
import Spinner from '../UI/Spinner';

import './styles.css';

class RosterLeaderboards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      leaderboards: false
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.callGetClanLeaderboards();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  callGetClanLeaderboards = async () => {
    const { member, auth, groupMembers, mode } = this.props;

    const result = member.data.groups.results.length > 0 ? member.data.groups.results[0] : false;

    const isAuthed = auth && auth.destinyMemberships && auth.destinyMemberships.find(m => m.membershipId === member.membershipId);

    if (!groupMembers.groupId && !groupMembers.loading) {
      await getGroupMembers(result.group, result.member.memberType > 2 && isAuthed);
    } else if (groupMembers.loading && groupMembers.members.length < 1) {
      return;
    } else {
      const responses = await Promise.all(
        groupMembers.members.map(async member => {
          try {
            const response = await bungie.GetHistoricalStats(member.destinyUserInfo.membershipType, member.destinyUserInfo.membershipId, '0', '1', '4,5,18,37,46,63,75,77,82', '0');

            if (response && response.ErrorCode === 1) {
              return {
                ...member,
                historicalStats: response.Response
              };
            } else {
              
              throw Error;
            }            
          } catch (e) {
            console.log(`Something went wrong with ${member.destinyUserInfo.membershipId}: ${e}`);
          }
        })
      );

      if (this.mounted) {
        this.responses = responses;

        this.generateLeaderboards();
      }
    }
  };

  scopes = [
    {
      name: manifest.DestinyActivityModeDefinition[1164760504].displayProperties.name,
      value: 'allPvP'
    },
    {
      name: manifest.DestinyActivityModeDefinition[2239249083].displayProperties.name,
      value: 'survival'
    },
    {
      name: manifest.DestinyActivityModeDefinition[1848252830].displayProperties.name,
      value: 'pvecomp_gambit',
      statIds: [
        {
          value: 'motesDeposited',
          type: 'integer'
        },
        {
          value: 'motesLost',
          type: 'integer'
        },
        {
          name: 'High Value Target Kills',
          value: 'highValueKills',
          type: 'integer'
        },
        {
          name: 'Invasion Kills',
          value: 'invasionKills',
          type: 'integer'
        },
        {
          name: 'Invader Kills',
          value: 'invaderKills',
          type: 'integer'
        },
        {
          name: 'Primeval Damage',
          value: 'primevalDamage',
          type: 'integer'
        },
        {
          name: 'Primeval Kills',
          value: 'primevalKills',
          type: 'integer'
        }
      ]
    },
    {
      name: manifest.DestinyActivityModeDefinition[1418469392].displayProperties.name,
      value: 'pvecomp_mamba',
      statIds: [
        {
          value: 'motesDeposited',
          type: 'integer'
        },
        {
          value: 'motesLost',
          type: 'integer'
        },
        {
          name: 'High Value Target Kills',
          value: 'highValueKills',
          type: 'integer'
        },
        {
          name: 'Invasion Kills',
          value: 'invasionKills',
          type: 'integer'
        },
        {
          name: 'Invader Kills',
          value: 'invaderKills',
          type: 'integer'
        },
        {
          name: 'Primeval Damage',
          value: 'primevalDamage',
          type: 'integer'
        },
        {
          name: 'Primeval Kills',
          value: 'primevalKills',
          type: 'integer'
        }
      ]
    },
    {
      name: manifest.DestinyActivityModeDefinition[2394616003].displayProperties.name,
      value: 'allStrikes'
    },
    {
      name: manifest.DestinyActivityModeDefinition[547513715].displayProperties.name,
      value: 'scored_nightfall'
    },
    {
      name: manifest.DestinyActivityModeDefinition[400075666].displayProperties.name,
      value: 'caluseum'
    },
    {
      name: manifest.DestinyActivityModeDefinition[608898761].displayProperties.name,
      value: 'dungeon'
    },
    {
      name: manifest.DestinyActivityModeDefinition[2043403989].displayProperties.name,
      value: 'raid'
    }
  ];

  statIds = [
    {
      value: 'kills',
      type: 'integer'
    },
    {
      value: 'deaths',
      type: 'integer'
    },
    {
      value: 'killsDeathsRatio',
      type: 'float'
    },
    {
      value: 'suicides',
      type: 'integer'
    },
    {
      value: 'secondsPlayed',
      type: 'moment'
    },
    {
      value: 'bestSingleGameKills',
      type: 'integer'
    },
    {
      value: 'precisionKills',
      type: 'integer'
    },
    {
      value: 'longestKillSpree',
      type: 'integer'
    },
    {
      value: 'longestKillDistance',
      type: 'distance'
    },
    {
      value: 'longestSingleLife',
      type: 'time'
    }
  ];

  statIdsSummary = [
    {
      value: 'kills',
      type: 'integer'
    },
    {
      value: 'deaths',
      type: 'integer'
    },
    {
      value: 'activitiesCleared',
      type: 'integer'
    },
    {
      value: 'activitiesWon',
      type: 'integer'
    },
    {
      value: 'secondsPlayed',
      type: 'moment'
    },
    {
      value: 'orbsDropped',
      type: 'integer'
    },
    {
      value: 'motesDeposited',
      type: 'integer'
    },
    {
      name: t('Primeval damage'),
      value: 'primevalDamage',
      type: 'integer'
    },
    {
      name: t('Primeval kills'),
      value: 'primevalKills',
      type: 'integer'
    }
  ];

  generateLeaderboards = () => {
    const leaderboards = {
      summary: {}
    };

    this.scopes.forEach(scope => {
      leaderboards[scope.value] = {};

      const scopeStatIds = scope.statIds || [];

      scopeStatIds.concat(this.statIds).forEach(statId => {
        leaderboards[scope.value][statId.value] = orderBy(
          this.responses.map(m => {
            try {
              return {
                destinyUserInfo: {
                  ...m.destinyUserInfo,
                  groupId: m.groupId
                },
                value: m.historicalStats[scope.value].allTime[statId.value].basic.value,
                displayValue: m.historicalStats[scope.value].allTime[statId.value].basic.displayValue
              };
            } catch (e) {
              return {
                destinyUserInfo: {
                  ...m.destinyUserInfo,
                  groupId: m.groupId
                },
                value: 0,
                displayValue: 0
              };
            }
          }),
          [m => m.value],
          ['desc']
        );
      });

      this.statIdsSummary.forEach(statId => {
        const target = statId.value === 'activitiesWon' ? 'activitiesCleared' : statId.value;
        
        leaderboards.summary[target] = this.responses.reduce((a, m) => {
          try {
            return a + m.historicalStats[scope.value].allTime[statId.value].basic.value;
          } catch (e) {
            return a + 0;
          }
        }, leaderboards.summary[target] || 0);
      });
    });

    this.setState({ loading: false, leaderboards });
  };

  componentDidUpdate(pP, pS) {
    if (pP.groupMembers.lastUpdated !== this.props.groupMembers.lastUpdated && this.props.groupMembers.members.length && this.state.loading) {
      this.callGetClanLeaderboards();
    }
  }

  prettyValue = (statId, value, displayValue) => {
    const stat = this.statIds.concat(this.statIdsSummary).concat(this.scopes.reduce((a, s) => {
      return [
        ...a,
        ...s.statIds || []
      ]
    }, [])).find(s => s.value === statId);

    if (stat && stat.type === 'moment') {
      return duration({ hours: Math.ceil(value / 3600) }, { unit: 'hours', abbreviated: true });
    } else if (stat && stat.type === 'distance') {
      return Math.floor(value) + 'm';
    } else if (stat && stat.type === 'integer') {
      return parseInt(value, 10).toLocaleString();
    } else {
      return displayValue;
    }
  }

  elScopes = scope => {
    const scopes = this.scopes.map(s => {
      return (
        <li key={s.value} className={cx('linked', { active: scope === s.value })}>
          <div className='text'>{s.name}</div>
          <ProfileNavLink to={`/clan/stats/${s.value}`} />
        </li>
      );
    });

    scopes.unshift(
      <li key='summary' className={cx('linked', { active: !scope })}>
        <div className='text'>{t('Summary')}</div>
        <ProfileNavLink exact to={`/clan/stats`} />
      </li>
    );

    return scopes;
  };

  elBoards = (scopeId, statId) => {
    const { member, groupMembers } = this.props;

    if (statId) {
      const definitionStat = manifest.DestinyHistoricalStatsDefinition[statId];
      const scope = this.scopes.find(s => s.value === scopeId);
      const stat = (scope.statIds || []).concat(this.statIds).find(s => s.value === statId);
      
      return (
        <div key={statId} className='module'>
          <div className='module-header'>
            <div className='sub-name'>{stat.name ? stat.name : definitionStat.statName}</div>
          </div>
          <ul key={statId} className='list leaderboard'>
            {this.state.leaderboards[scopeId][statId].map((m, i) => {
              const isSelf = m.destinyUserInfo.membershipType.toString() === member.membershipType && m.destinyUserInfo.membershipId === member.membershipId;

              return (
                <li key={m.destinyUserInfo.membershipId} className={cx('row', { self: isSelf })}>
                  <ul>
                    <li className='col member'>
                      <MemberLink type={m.destinyUserInfo.membershipType} id={m.destinyUserInfo.membershipId} groupId={m.destinyUserInfo.groupId} displayName={m.destinyUserInfo.displayName} />
                    </li>
                    <li className='col rank'>{i + 1}</li>
                    <li className='col value'>{this.prettyValue(statId, m.value, m.displayValue)}</li>
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      )
    } else {
      return Object.entries(this.state.leaderboards[scopeId])
        .map(([statId, data]) => {
          const definitionStat = manifest.DestinyHistoricalStatsDefinition[statId];
          const scope = this.scopes.find(s => s.value === scopeId);
          const stat = (scope.statIds || []).concat(this.statIds).find(s => s.value === statId);

          return {
            name: statId,
            el: (
              <div key={statId} className='module'>
                <div className='module-header'>
                  <div className='sub-name'>{stat.name ? stat.name : definitionStat.statName}</div>
                </div>
                <ul key={statId} className='list leaderboard'>
                  {data.slice(0, 10).map((m, i) => {
                    const isSelf = m.destinyUserInfo.membershipType.toString() === member.membershipType && m.destinyUserInfo.membershipId === member.membershipId;

                    return (
                      <li key={m.destinyUserInfo.membershipId} className={cx('row', { self: isSelf })}>
                        <ul>
                          <li className='col member'>
                            <MemberLink type={m.destinyUserInfo.membershipType} id={m.destinyUserInfo.membershipId} groupId={m.destinyUserInfo.groupId} displayName={m.destinyUserInfo.displayName} />
                          </li>
                          <li className='col rank'>{i + 1}</li>
                          <li className='col value'>{this.prettyValue(statId, m.value, m.displayValue)}</li>
                        </ul>
                      </li>
                    );
                  })}
                </ul>
                <ProfileLink className='button' to={`/clan/stats/${scopeId}/${statId}`}>
                  <div className='text'>{t('See all {{members}} members', { members: groupMembers.members.length })}</div>
                </ProfileLink>
              </div>
            )
          };
        })
        .map(e => e.el);
    }
  };

  render() {
    const { scopeId, statId } = this.props;

    if (!this.state.loading) {
      const knownScope = this.scopes.find(s => s.value === scopeId);
      const knownStat = ((knownScope && knownScope.statIds) || []).concat(this.statIds).find(s => s.value === statId);

      if (scopeId && knownScope && statId && knownStat) {
        const definitionStat = manifest.DestinyHistoricalStatsDefinition[statId];

        return (
          <div className='wrapper'>
            <div className='bread'>
              <span>{t('Historical stats')}</span>
              <span>{knownScope.name}</span>
              <span>{knownStat.name ? knownStat.name : definitionStat.statName}</span>
            </div>
            <div className='module views scopes'>
              <ul className='list'>{this.elScopes(scopeId)}</ul>
            </div>
            <div className='boards single'>{this.elBoards(scopeId, statId)}</div>
          </div>
        );
      } else if (scopeId && knownScope) {
        return (
          <div className='wrapper'>
            <div className='bread'>
              <span>{t('Historical stats')}</span>
              <span>{knownScope.name}</span>
            </div>
            <div className='module views scopes'>
              <ul className='list'>{this.elScopes(scopeId)}</ul>
            </div>
            <div className='boards'>{this.elBoards(scopeId)}</div>
          </div>
        );
      } else {
        return (
          <div className='wrapper'>
            <div className='bread'>
              <span>{t('Historical stats')}</span>
            </div>
            <div className='module views scopes'>
              <ul className='list'>{this.elScopes(scopeId)}</ul>
            </div>
            <div className='boards summary-stats'>
              {Object.entries(this.state.leaderboards.summary).map(([statId, value]) => {
                const definitionStat = manifest.DestinyHistoricalStatsDefinition[statId];
                const stat = this.statIdsSummary.find(s => s.value === statId);

                return (
                  <div key={statId} className='stat'>
                    <div className='name'>{stat.name ? stat.name : definitionStat.statName}</div>
                    <div className='value'>{this.prettyValue(statId, value)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        );
      }
    } else {
      return <Spinner />;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    auth: state.auth,
    groupMembers: state.groupMembers
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(RosterLeaderboards);
