import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import Collectibles from '../../Collectibles';
import Items from '../../Items';

import './styles.css';
import manifest from '../../../utils/manifest';

class AltarsOfSorrow extends React.Component {
  render() {
    const { t, cycleInfo } = this.props;

    const rotation = {
      1: {
        boss: {
          name: t('Nightmare of Taniks, the Scarred')
        },
        items: [],
        collectibles: [
          935628460    // Apostate
        ]
      },
      2: {
        boss: {
          name: t('Nightmare of Zydron, Gate Lord')
        },
        triumphs: [],
        items: [],
        collectibles: [
          651531704   // Heretic
        ]
      },
      3: {
        boss: {
          name: t('Nightmare of Phogoth')
        },
        triumphs: [],
        items: [],
        collectibles: [
          3844835635  // Blasphemer
        ]
      }
    };

    return (
      <div className='user-module altar-of-sorrow'>
        <div className='sub-header'>
          <div>{manifest.DestinyInventoryItemDefinition[2531049971]?.displayProperties.name}</div>
        </div>
        <h3>{rotation[cycleInfo.week.altars].boss.name}</h3>
        <div className='text'>
          <p><em>{manifest.DestinyInventoryItemDefinition[2531049971]?.displayProperties.description}</em></p>
        </div>
        <h4>{t('Collectibles')}</h4>
        <ul className='list collection-items'>
          <Collectibles selfLinkFrom='/now' hashes={rotation[cycleInfo.week.altars].collectibles} />
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

export default compose(
  connect(mapStateToProps),
  withTranslation()
)(AltarsOfSorrow);
