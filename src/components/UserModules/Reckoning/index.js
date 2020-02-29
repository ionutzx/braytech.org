import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import Records from '../../Records';

import './styles.css';

class Reckoning extends React.Component {
  render() {
    const { t, member, cycleInfo } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    const rotation = {
      1: {
        boss: t('Likeness of Oryx'),
        triumphs: [2653311362],
        collectibles: []
      },
      2: {
        boss: t('The Swords'),
        triumphs: [2653311362],
        collectibles: []
      }
    };

    const reckoningTierI = characterActivities[member.characterId].availableActivities.find(a => a.activityHash === 3143659188);

    return (
      <>
        <div className='sub-header'>
          <div>{manifest.DestinyPlaceDefinition[4148998934]?.displayProperties.name}</div>
        </div>
        <h3>{rotation[cycleInfo.week.reckoning].boss}</h3>
        <div className='text'>
          <p><em>{t("The Drifter's gambit goes deeper than once thought. Annihilate ancient Taken hoards within The Drifter's mysterious haul and gain The Nine's favour.")}</em></p>
        </div>
        <h4>{t('Active modifiers')}</h4>
        <ul className='list modifiers'>
          {reckoningTierI.modifierHashes.map((hash, h) => {
            const definitionModifier = manifest.DestinyActivityModifierDefinition[hash];

            return (
              <li key={h}>
                <div className='icon'>
                  <ObservedImage className='image' src={`https://www.bungie.net${definitionModifier.displayProperties.icon}`} />
                </div>
                <div className='text'>
                  <div className='name'>{definitionModifier.displayProperties.name}</div>
                  <div className='description'>{definitionModifier.displayProperties.description}</div>
                </div>
              </li>
            );
          })}
        </ul>
        <h4>{t('Triumphs')}</h4>
        <ul className='list record-items'>
          <Records selfLinkFrom='/this-week' hashes={rotation[cycleInfo.week.reckoning].triumphs} ordered />
        </ul>
      </>
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
  withTranslation()
)(Reckoning);
