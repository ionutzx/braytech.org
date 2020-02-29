import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import Collectibles from '../../Collectibles';
import Items from '../../Items';

import './styles.css';
import manifest from '../../../utils/manifest';

class EscalationProtocol extends React.Component {
  render() {
    const { t, cycleInfo } = this.props;

    const rotation = {
      1: {
        boss: {
          name: t('Nur Abath, Crest of Xol'),
          description: t('A mostly typical Hive ogre, _Nur Abath_ is protected by an invulnerability shield that draws its power from nearby minions. Clear them out to disable his shield and proceed to destroy him.')
        },
        items: [
          // https://github.com/Bungie-net/api/issues/732
          3243866699  // Worldline Ideasthesia: Torsion
        ],
        collectibles: [
          1041306082  // IKELOS_SG
        ]
      },
      2: {
        boss: {
          name: t('Kathok, Roar of Xol'),
          description: t('A Hive knight, _Kathok_ will continuously bombard players with his boomer. He is protected by shriekers, minions, and an invulnerability shield. Diminish his shield by attacking it with the swords of fallen _Severing Knights_.')
        },
        triumphs: [],
        items: [
          3243866698  // Worldline Ideasthesia: Anarkhiia
        ],
        collectibles: [
          2998976141  // IKELOS_SMG
        ]
      },
      3: {
        boss: {
          name: t('Damkath, The Mask'),
          description: t("A mostly typical Hive ogre, _Damkath's_ vulnerability is a pulsating cow-sized cyst on his upper-back.")
        },
        triumphs: [],
        items: [
          // https://youtu.be/lrPf16ZHevU?t=104
          3243866697  //Worldline Ideasthesia: Cavalry
        ],
        collectibles: [
          1203091693  // IKELOS_SR
        ]
      },
      4: {
        boss: {
          name: t('Naksud, the Famine'),
          description: t('A well-defended ogre, _Naksud_ can be damaged at any time. Although, he regularly calls forth cursed thrall which sprint towards him, bursting upon him, healing him.')
        },
        triumphs: [],
        items: [
          3243866696  //  Worldline Ideasthesia: Faktura
        ],
        collectibles: [
          1041306082, // IKELOS_SG
          2998976141, // IKELOS_SMG
          1203091693  // IKELOS_SR
        ]
      },
      5: {
        boss: {
          name: t('Bok Litur, Hunger of Xol'),
          description: t('A typical Hive knight, _Bok Litur_ is well-defended and well-armed. A challenging foe.')
        },
        triumphs: [],
        items: [
          3243866703  // Worldline Ideasthesia: Black Square
        ],
        collectibles: [
          1041306082, // IKELOS_SG
          2998976141, // IKELOS_SMG
          1203091693  // IKELOS_SR
        ]
      }
    };

    return (
      <div className='user-module escalation-protocol'>
        <div className='sub-header'>
          <div>{t('Escalation Protocol')}</div>
        </div>
        <h3>{rotation[cycleInfo.week.ep].boss.name}</h3>
        <div className='text'>
          <ReactMarkdown source={rotation[cycleInfo.week.ep].boss.description} />
          <p><em>{manifest.DestinyInventoryItemDefinition[4132073280]?.displayProperties?.description}</em></p>
        </div>
        <h4>{t('Collectibles')}</h4>
        <ul className='list collection-items'>
          <Collectibles selfLinkFrom='/this-week' hashes={rotation[cycleInfo.week.ep].collectibles} />
        </ul>
        <h4>{t('Catalyst item')}</h4>
        <ul className='list inventory-items as-panels'>
          <Items
            items={rotation[cycleInfo.week.ep].items.map(i => {
              return {
                itemHash: i
              };
            })}
            asPanels
          />
        </ul>
        <div className='info'>{t('Braytech can not determine which Worldline Zero catalyst components you have attained, but it can tell you which bosses drop which items in case you happened to be keeping a list.')}</div>
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
  connect(mapStateToProps),
  withTranslation()
)(EscalationProtocol);
