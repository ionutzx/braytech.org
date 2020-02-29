import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import Collectibles from '../../Collectibles';
import Records from '../../Records';

import './styles.css';

class Menagerie extends React.Component {
  render() {
    const { t, member, cycleInfo } = this.props;
    const characters = member.data.profile.characters.data;
    const characterActivities = member.data.profile.characterActivities.data;

    const rotation = {
      1: {
        boss: t('Hasapiko, Beloved by Calus'),
        triumphs: [3141945846, 2422246606, 2422246593],
        items: [],
        collectibles: {
          0: [1692129580, 2678796997],
          1: [3376099856, 2678796997],
          2: [1572606157, 2678796997]
        }
      },
      2: {
        boss: t('Arunak, Beloved by Calus'),
        triumphs: [1959753477, 2422246607, 2472579457],
        items: [],
        collectibles: {
          0: [1692129580, 2678796997],
          1: [3376099856, 2678796997],
          2: [1572606157, 2678796997]
        }
      },
      3: {
        boss: t('Pagouri, Beloved by Calus'),
        triumphs: [2351146132, 2422246605, 2422246592],
        items: [],
        collectibles: {
          0: [1692129580, 2678796997],
          1: [3376099856, 2678796997],
          2: [1572606157, 2678796997]
        }
      }
    };

    const heroicMenagerie = characterActivities[member.characterId].availableActivities.find(a => {
      const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

      if (definitionActivity && definitionActivity.activityModeHashes && definitionActivity.activityModeHashes.includes(400075666) && definitionActivity.activityTypeHash === 400075666) {
        return true;
      } else {
        return false;
      }
    });

    return (
      <>
        <div className='sub-header'>
          <div>{manifest.DestinyPlaceDefinition[2096719558]?.displayProperties.name}</div>
        </div>
        <h3>{rotation[cycleInfo.week.menagerie].boss}</h3>
        <div className='text'>
          <p><em>{manifest.DestinyPlaceDefinition[2096719558]?.displayProperties?.description}</em></p>
        </div>
        {heroicMenagerie ? (
          <>
            <h4>{t('Active modifiers')}</h4>
            <ul className='list modifiers'>
              {heroicMenagerie.modifierHashes.map((hash, h) => {
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
          </>
        ) : null}
        <h4>{t('Heroic collectibles')}</h4>
        <ul className='list collection-items'>
          <Collectibles selfLinkFrom='/this-week' hashes={rotation[cycleInfo.week.menagerie].collectibles[characters.find(c => c.characterId === member.characterId).classType]} />
        </ul>
        <h4>{t('Triumphs')}</h4>
        <ul className='list record-items'>
          <Records selfLinkFrom='/this-week' hashes={rotation[cycleInfo.week.menagerie].triumphs} />
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

export default compose(connect(mapStateToProps), withTranslation())(Menagerie);
