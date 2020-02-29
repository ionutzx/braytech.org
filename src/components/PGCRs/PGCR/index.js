import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { orderBy, groupBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as bungie from '../../../utils/bungie';
import * as utils from '../../../utils/destinyUtils';
import { Button, DestinyKey } from '../../UI/Button';
import MemberLink from '../../MemberLink';

import { ReportHeader, ReportHeaderLarge } from './ReportHeader';
import { EntryHeader, EntryDetail } from './EntryRow';

import './styles.css';

const unfinishableActivityModes = [
  6,  // Patrol
  76, // Reckoning
];

const headInViewport = function(element) {
  const bounding = element.getBoundingClientRect();

  return bounding.top >= 0;
}

class ReportItem extends React.Component {
  state = {
    expandedReport: Boolean(this.props.expanded),
    expandedPlayers: [],
    playerCache: []
  }

  ref_parent = React.createRef();

  handler_expand = e => {
    this.setState(p => ({
      ...p,
      expandedReport: true
    }));

    this.updatePlayerCache();
  };

  handler_contract = e => {
    this.setState(p => ({
      ...p,
      expandedReport: false,
      expandedPlayers: []
    }));

    if (!headInViewport(this.ref_parent.current)) {
      this.ref_parent.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  updatePlayerCache = () => {
    const { report } = this.props;

    if (report) {
      report.entries.forEach(async e => {
        const progression = await this.getProgression(e.player.destinyUserInfo.membershipType, e.player.destinyUserInfo.membershipId, e.characterId);

        if (this.mounted) {
          this.setState(p => ({
            ...p,
            playerCache: [
              ...p.playerCache,
              {
                membershipId: e.player.destinyUserInfo.membershipId,
                ...progression.points,
                ...progression.resets
              }
            ]
          })); 
        }
      });
    }
  };

  getProgression = async (membershipType, membershipId) => {
    let response = await bungie.GetProfile({
      params: {
        membershipType,
        membershipId,
        components: '202,900'
      }
    });

    if (!response || (response && response.ErrorCode !== 1) || (response && response.ErrorCode === 1 && !response.Response.characterProgressions.data)) {
      return {
        points: {
          
        },
        resets: {
          
        }
      };
    }

    // in case the PGCR refers to a character that has since been deleted, as is the case with "5364501167"
    const characterId = Object.keys(response.Response.characterProgressions.data)[0];

    const characterProgressions = response.Response.characterProgressions.data;
    const characterRecords = response.Response.characterRecords.data;
    const profileRecords = response.Response.profileRecords.data.records;

    const gloryPoints = characterProgressions[characterId].progressions[2000925172].currentProgress.toLocaleString();
    const valorPoints = characterProgressions[characterId].progressions[2626549951].currentProgress.toLocaleString();
    const infamyPoints = characterProgressions[characterId].progressions[2772425241].currentProgress.toLocaleString();
    
    return {
      points: {
        gloryPoints,
        valorPoints,
        infamyPoints
      },
      resets: {
        valorResets: utils.calculateResets(3882308435, characterId, characterProgressions, characterRecords, profileRecords).resetsTotal,
        infamyResets: utils.calculateResets(2772425241, characterId, characterProgressions, characterRecords, profileRecords).resetsTotal
      }
    };
  };

  handler_togglePlayer = characterId => e => {
    const { expandedPlayers } = this.state;

    if (expandedPlayers.includes(characterId)) {
      this.setState(p => ({
        ...p,
        expandedPlayers: [
          ...p.expandedPlayers.filter(c => c !== characterId)
        ]
      }));
    } else {
      this.setState(p => ({
        ...p,
        expandedPlayers: [
          ...p.expandedPlayers,
          characterId
        ]
      }));
    }
  };

  componentDidMount() {
    this.mounted = true;

    if (this.props.expanded) {
      this.updatePlayerCache();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(p, s) {
    if (s.expandedReport !== this.state.expandedReport || s.expandedPlayers !== this.state.expandedPlayers) {
      this.props.rebindTooltips();
    }
  }

  render() {
    const { t, member, report, expanded } = this.props;

    const characters = member.data && member.data.profile.characters.data;
    const characterIds = characters && characters.map(c => c.characterId);

    const { expandedReport, expandedPlayers, playerCache } = this.state;

    const isFinishable = !unfinishableActivityModes.filter(mode => report.activityDetails.modes.indexOf(mode) > -1).length;

   
    if (expandedReport) console.log(this.props);

    const entry = characterIds && report.entries.find(entry => characterIds.includes(entry.characterId));
    const standing = entry && entry.values.standing && entry.values.standing.basic.value !== undefined ? entry.values.standing.basic.value : -1;


    const entries = report.entries.map(entry => {
      const dnf = entry.values.completed.basic.value === 0 && isFinishable ? true : false;
      const isExpandedPlayer = expandedPlayers.includes(entry.characterId);

      return {
        teamId: report.teams && report.teams.length ? entry.values.team.basic.value : null,
        fireteamId: entry.values.fireteamId ? entry.values.fireteamId.basic.value : null,
        element: (
          <li key={entry.characterId} className={cx({ expanded: isExpandedPlayer })}>
            <ul>
              <li className={cx('linked', 'inline', { dnf: dnf })} onClick={this.handler_togglePlayer(entry.characterId)}>
                <div className='member'>
                  <MemberLink type={entry.player.destinyUserInfo.membershipType} id={entry.player.destinyUserInfo.membershipId} displayName={entry.player.destinyUserInfo.displayName} characterId={entry.characterId} />
                </div>
                <EntryHeader activityDetails={report.activityDetails} entry={entry} playerCache={playerCache} />
              </li>
              {isExpandedPlayer ? <li>
                <EntryDetail activityDetails={report.activityDetails} entry={entry} playerCache={playerCache} />
              </li> : null}
            </ul>
          </li>
        )
      };
    });



    const body = (
      <>
        <ReportHeaderLarge characterIds={characterIds} {...report} />
        <div className='entries'>
          {report.teams && report.teams.length ? (
            orderBy(report.teams, [t => t.score.basic.value], ['desc']).map(team => {
              const fireteams = Object.values(groupBy(entries.filter(e => e.teamId === team.teamId), 'fireteamId'));

              return (
                <ul key={team.teamId} className='team'>
                  <li className={cx('header team', team.teamId === 17 ? 'alpha' : 'bravo')}>
                    <div className='team name'>{team.teamId === 17 ? t('Alpha team') : t('Bravo team')}</div>
                    <EntryHeader activityDetails={report.activityDetails} team />                    
                    <div className='team score hideInline'>{team.score.basic.displayValue}</div>
                  </li>
                  {fireteams.map((f, i) => {
                    return (
                      <li key={i}>
                        <ul className={cx('list', 'fireteam', { stacked: f.length > 1 })}>{f.map(e => e.element)}</ul>
                      </li>
                    );
                  })}
                </ul>
              );
            })
          ) : (
            <ul className='team'>
              <li className={cx('header team')}>
                <div className='team name' />
                <EntryHeader activityDetails={report.activityDetails} team />
                <div className='team score hideInline' />
              </li>
              {Object.values(groupBy(entries, 'fireteamId')).map((f, i) => {
                return (
                  <li key={i}>
                    <ul className={cx('list', 'fireteam', { stacked: f.length > 1 })}>{f.map(e => e.element)}</ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {!expanded && (
          <div className='sticky-nav inline'>
            <div className='wrapper'>
              <div />
              <ul>
                <li>
                  <a className='button' href={`/pgcr/${report.activityDetails.instanceId}`} target='_blank'>
                    <DestinyKey type='more' />
                    {t('New tab')}
                  </a>
                </li>
                <li>
                  <Button action={this.handler_contract}>
                    <DestinyKey type='dismiss' />
                    {t('Close')}
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </>
    );

    return (
      <li key={report.activityDetails.instanceId} ref={this.ref_parent} className={cx('linked', { isExpanded: expandedReport, standing: standing > -1, victory: standing === 0 })} onClick={!expandedReport ? this.handler_expand : undefined}>
      {!expandedReport ? <ReportHeader characterIds={characterIds} {...report} /> : body}
      </li>
    );
    
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

ReportItem = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withTranslation()
)(ReportItem);

export default ReportItem;

export { ReportItem };
