import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import manifest from '../../../utils/manifest';

import { ReactComponent as CrucibleIconDefault } from '../../../svg/crucible/default.svg';
import { ReactComponent as CrucibleIconMayhem } from '../../../svg/crucible/mayhem.svg';
import { ReactComponent as CrucibleIconBreakthrough } from '../../../svg/crucible/breakthrough.svg';
import { ReactComponent as CrucibleIconClash } from '../../../svg/crucible/clash.svg';
import { ReactComponent as CrucibleIconShowdown } from '../../../svg/crucible/showdown.svg';
import { ReactComponent as CrucibleIconTeamScorched } from '../../../svg/crucible/team-scorched.svg';
import { ReactComponent as CrucibleIconCountdown } from '../../../svg/crucible/countdown.svg';
import { ReactComponent as CrucibleIconSupremacy } from '../../../svg/crucible/supremacy.svg';
import { ReactComponent as CrucibleIconLockdown } from '../../../svg/crucible/lockdown.svg';
import { ReactComponent as CrucibleIconMomentumControl } from '../../../svg/crucible/momentum-control.svg';
import { ReactComponent as CrucibleIconDoubles } from '../../../svg/crucible/doubles.svg';
import { ReactComponent as CrucibleIconCrimsonDoubles } from '../../../svg/crucible/crimson-doubles.svg';
import { ReactComponent as CrucibleIconSurvival } from '../../../svg/crucible/elimination.svg';
import { ReactComponent as CrucibleIconIronBanner } from '../../../svg/crucible/iron-banner.svg';

import './styles.css';

const crucibleRotators = [
  3753505781, // Iron Banner
  2303927902, // Clash
  3780095688, // Supremacy
  1219083526, // Team Scorched
  4209226441, // Hardware
  952904835, // Momentum Control
  1102379070, // Mayhem
  3011324617, // Breakthrough
  3646079260, // Countdown
  1457072306, // Showdown
  3239164160, // Lockdown
  // 740422335, // Survival
  920826395,  // Doubles
  3633915199, // Crimson Doubles
];

const crucibleModeIcons = {
  3753505781: <CrucibleIconIronBanner />,
  2303927902: <CrucibleIconClash />,
  3780095688: <CrucibleIconSupremacy />,
  1219083526: <CrucibleIconTeamScorched />,
  4209226441: <CrucibleIconDefault />,
  952904835:  <CrucibleIconMomentumControl />,
  1102379070: <CrucibleIconMayhem />,
  3011324617: <CrucibleIconBreakthrough />,
  3646079260: <CrucibleIconCountdown />,
  1457072306: <CrucibleIconShowdown />,
  3239164160: <CrucibleIconLockdown />,
  740422335:  <CrucibleIconSurvival />,
  920826395:  <CrucibleIconDoubles />,
  3633915199: <CrucibleIconCrimsonDoubles />
};

class CrucibleRotators extends React.Component {
  render() {
    const { t, member } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    // console.log(characterActivities[member.characterId].availableActivities.map(a => {
    //   if (!a.activityHash) return false;
    //   const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

    //   return {
    //     name: definitionActivity.displayProperties.name,
    //     ...a,
    //     definitionActivity
    //   }
    // }));
    
    const featuredCrucibleModes = characterActivities[member.characterId].availableActivities.filter(a => {
      if (!a.activityHash) return false;
      const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

      if (definitionActivity && crucibleRotators.includes(definitionActivity.hash)) {
        a.displayProperties = definitionActivity.displayProperties;
        a.icon = crucibleModeIcons[definitionActivity.hash] || null;
        return true;
      }

      return false;
    });

    return (
      <div className='user-module crucible-rotators'>
        <div className='sub-header'>
          <div>{manifest.DestinyPlaceDefinition[4088006058]?.displayProperties.name}</div>
        </div>
        <div className='text'>
          <p>
            <em>{t('The following Crucible modes are currently in rotation and available for you to test your vigour in against other Guardians.')}</em>
          </p>
        </div>
        <h4>{t('Rotator playlists')}</h4>
        <div className='activity-mode-icons'>
          {featuredCrucibleModes.map((f, i) => {
            return (
              <div key={i}>
                <div className='icon'>{f.icon}</div>
                <div className='text'>{f.displayProperties.name}</div>
              </div>
            );
          })}
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

export default compose(
  connect(
    mapStateToProps
  ),
  withTranslation()
)(CrucibleRotators);