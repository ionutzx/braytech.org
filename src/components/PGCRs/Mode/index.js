import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import { ProfileNavLink } from '../../ProfileLink';

import { ReactComponent as CrucibleIconDefault } from '../../../svg/crucible/default.svg';
import { ReactComponent as CrucibleIconControl } from '../../../svg/crucible/control.svg';
import { ReactComponent as CrucibleIconElimination } from '../../../svg/crucible/elimination.svg';
import { ReactComponent as CrucibleIconSurvival } from '../../../svg/crucible/survival.svg';
import { ReactComponent as CrucibleIconRumble } from '../../../svg/crucible/rumble.svg';
import { ReactComponent as CrucibleIconMayhem } from '../../../svg/crucible/mayhem.svg';
import { ReactComponent as CrucibleIconDoubles } from '../../../svg/crucible/doubles.svg';
import { ReactComponent as CrucibleIconCrimsonDoubles } from '../../../svg/crucible/crimson-doubles.svg';
import { ReactComponent as CrucibleIconBreakthrough } from '../../../svg/crucible/breakthrough.svg';
import { ReactComponent as CrucibleIconClash } from '../../../svg/crucible/clash.svg';
import { ReactComponent as CrucibleIconShowdown } from '../../../svg/crucible/showdown.svg';
import { ReactComponent as CrucibleIconTeamScorched } from '../../../svg/crucible/team-scorched.svg';
import { ReactComponent as CrucibleIconCountdown } from '../../../svg/crucible/countdown.svg';
import { ReactComponent as CrucibleIconSupremacy } from '../../../svg/crucible/supremacy.svg';
import { ReactComponent as CrucibleIconLockdown } from '../../../svg/crucible/lockdown.svg';
import { ReactComponent as CrucibleIconMomentumControl } from '../../../svg/crucible/momentum-control.svg';
import { ReactComponent as CrucibleIconIronBanner } from '../../../svg/crucible/iron-banner.svg';

import { ReactComponent as GambitIconGambit } from '../../../svg/gambit/gambit.svg';
import { ReactComponent as GambitIconGambitPrime } from '../../../svg/gambit/gambit-prime.svg';
import { ReactComponent as GambitIconReckoning } from '../../../svg/gambit/reckoning.svg';

import { ReactComponent as VanguardIconStrikes } from '../../../svg/vanguard/strikes.svg';
import { ReactComponent as VanguardIconScoredNightfallStrikes } from '../../../svg/vanguard/scored-nightfall-strikes.svg';

import { ReactComponent as RaidIcon } from '../../../svg/raid/raid.svg';

import './styles.css';

class Mode extends React.Component {
  render() {
    const { t, match, location, stats, root = '/multiplayer/crucible', defaultMode = 5 } = this.props;
    const modeParam = parseInt(match.params.mode || defaultMode, 10);
   
    const definitionActivityMode = Object.values(manifest.DestinyActivityModeDefinition).find(d => d.modeType === stats.mode);

    const modeExtras = [
      // Crucible
      {
        modes: [73],
        icon: <CrucibleIconControl />,
        name: manifest.DestinyActivityDefinition[3176544780].displayProperties.name
      },
      {
        modes: [37],
        icon: <CrucibleIconSurvival />
      },
      {
        modes: [80],
        icon: <CrucibleIconElimination />
      },
      {
        modes: [48],
        icon: <CrucibleIconRumble />
      },
      {
        modes: [71],
        icon: <CrucibleIconClash />,
        name: manifest.DestinyActivityDefinition[2303927902].displayProperties.name
      },
      {
        modes: [43],
        icon: <CrucibleIconIronBanner />,
        name: manifest.DestinyActivityDefinition[3753505781].displayProperties.name
      },
      {
        modes: [81],
        icon: <CrucibleIconMomentumControl />,
        name: manifest.DestinyActivityDefinition[952904835].displayProperties.name
      },
      {
        modes: [50],
        icon: <CrucibleIconDoubles />
      },
      {
        modes: [15],
        icon: <CrucibleIconCrimsonDoubles />
      },
      {
        modes: [31],
        icon: <CrucibleIconSupremacy />
      },
      {
        modes: [60],
        icon: <CrucibleIconLockdown />
      },
      {
        modes: [65],
        icon: <CrucibleIconBreakthrough />
      },
      {
        modes: [59],
        icon: <CrucibleIconShowdown />
      },
      {
        modes: [38],
        icon: <CrucibleIconCountdown />
      },
      {
        modes: [25],
        icon: <CrucibleIconMayhem />
      },
      {
        modes: [61, 62],
        icon: <CrucibleIconTeamScorched />
      },

      // Gambit
      {
        modes: [63],
        icon: <GambitIconGambit />
      },
      {
        modes: [75],
        icon: <GambitIconGambitPrime />
      },
      {
        modes: [76],
        icon: <GambitIconReckoning />
      },

      // Raid
      {
        modes: [4],
        icon: <RaidIcon />
      },

      // Vanguard
      {
        modes: [18],
        icon: <VanguardIconStrikes />
      },
      {
        modes: [46],
        icon: <VanguardIconScoredNightfallStrikes />
      },

      // Default
      {
        modes: [5],
        icon: <CrucibleIconDefault />
      }
    ];

    const modeExtra = modeExtras.find(m => m.modes.includes(stats.mode));
    const isActive = (match, location) => {
      if (modeParam === stats.mode) {
        return true;
      } else {
        return false;
      }
    };
    
    return (
      <li className={cx('linked', { active: isActive(match, location) })}>
        <div className='icon'>
          {modeExtra && modeExtra.icon}
        </div>
        <div className='text'>
          <div className='name'>{(modeExtra && modeExtra.name) || definitionActivityMode?.displayProperties?.name}</div>
          {stats.killsDeathsRatio ? (
            <>
              <div className='minor-stats'>
                <div className='stat'>
                  <div className='name'>{definitionActivityMode?.activityModeCategory > 1 ? t('Matches') : t('Activities')}</div>
                  <div className='value'>{stats.activitiesEntered.basic.value.toLocaleString()}</div>
                </div>
                <div className='stat'>
                  <div className='name'>{manifest.DestinyHistoricalStatsDefinition['kills'].statName}</div>
                  <div className='value'>{stats.kills.basic.value.toLocaleString()}</div>
                </div>
                <div className='stat'>
                  <div className='name'>{manifest.DestinyHistoricalStatsDefinition['deaths'].statName}</div>
                  <div className='value'>{stats.deaths.basic.value.toLocaleString()}</div>
                </div>
              </div>
              <div className='stat kdr'>
                <div className='name'>K/D</div>
                <div className='value'>{Number.parseFloat(stats.killsDeathsRatio.basic.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </>
          ) : <div className='no-stats'><div>{t('No stats available')}</div></div>}
        </div>
        <ProfileNavLink isActive={isActive} to={{ pathname: stats.mode === parseInt(defaultMode, 10) ? root : `${root}/${stats.mode}`, state: {  } }} onClick={() => {
          let element = document.getElementById('matches');
          element.scrollIntoView({behavior: "smooth"});
        }} />
      </li>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withTranslation(),
  withRouter
)(Mode);
