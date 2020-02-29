import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';

import { ReactComponent as Void } from '../../../svg/miscellaneous/void.svg';
import { ReactComponent as Arc } from '../../../svg/miscellaneous/arc.svg';
import { ReactComponent as Solar } from '../../../svg/miscellaneous/solar.svg';

import './styles.css';

const singeMap = [
  {
    hash: 3362074814,
    className: 'void',
    char: '',
    svg: Void
  },
  {
    hash: 3215384520,
    className: 'arc',
    char: '',
    svg: Arc
  },
  {
    hash: 2558957669,
    className: 'solar',
    char: '',
    svg: Solar
  }
];

class WeeklyVanguardSinge extends React.Component {
  render() {
    const { t, member } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    const vanguardStrikes = characterActivities[member.characterId].availableActivities.find(a => a.activityHash === 4252456044);
    const activeSinge = vanguardStrikes && singeMap.find(s => vanguardStrikes.modifierHashes.indexOf(s.hash) > -1);

    const activityNames = [
      {
        hash: 4252456044,
        table: 'DestinyActivityDefinition'
      },
      {
        hash: 3028486709,
        table: 'DestinyPresentationNodeDefinition'
      },
      {
        hash: 175275639,
        table: 'DestinyActivityModeDefinition'
      },
      {
        hash: 1117466231,
        table: 'DestinyPresentationNodeDefinition'
      }
    ]
      .map(l => {
        try {
          if (manifest[l.table][l.hash].displayProperties.name === 'Heroic Adventure') {
            return manifest[l.table][l.hash].displayProperties.name + 's';
          } else {
            return manifest[l.table][l.hash].displayProperties.name;
          }
        } catch (e) {
          return false;
        }
      })
      .map(n => n);

    if (vanguardStrikes && activeSinge) {
      const definitionSinge = manifest.DestinyActivityModifierDefinition[activeSinge.hash];

      const SVG = activeSinge.svg;

      return (
        <div className='user-module weekly-vanguard-singe'>
          <div className='sub-header'>
            <div>{t('Vanguard singe')}</div>
          </div>
          <h3>{definitionSinge.displayProperties.name}</h3>
          <div className='text'>
            <p>
              <em>{t('The elemental burn shared by most activities this week. These activities include {{activities}}.', { activities: activityNames.join(', ') })}</em>
            </p>
          </div>
          <div className={cx('icon', activeSinge.className)}>
            <div className='outer'>
              <SVG />
            </div>
            <div className='inner'>
              <SVG />
            </div>
            {/* <div className='name'>{definitionSinge.displayProperties.name}</div> */}
          </div>
        </div>
      );
    } else {
      return (
        <div className='user-module weekly-vanguard-singe'>
          <div className='sub-header'>
            <div>{t('Vanguard singe')}</div>
          </div>
          <h3>{t('Unknown')}</h3>
          <div className='text'>
            <p>{t('Vanguard Strikes are unavailable for this character.')}</p>
            <p>
              <em>{t('The elemental burn shared by most activities this week. These activities include {{activities}}.', { activities: activityNames.join(', ') })}</em>
            </p>
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(connect(mapStateToProps), withTranslation())(WeeklyVanguardSinge);
