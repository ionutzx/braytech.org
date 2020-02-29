import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';

import Default from './Default';
import Braytech from './Braytech';

const woolworths = {
  braytech: Braytech
};

class UI extends React.Component {
  render() {
    const { t, member } = this.props;

    const item = {
      itemHash: this.props.hash,
      itemInstanceId: this.props.instanceid,
      itemComponents: null,
      relatedHash: this.props.related,
      quantity: parseInt(this.props.quantity || 1, 10),
      state: parseInt(this.props.state || 0, 10),
      rarity: 'common',
      type: this.props.type
    };

    const definition = item.type === 'braytech' ? manifest.BraytechDefinition[item.itemHash] : item.type === 'stat' ? manifest.DestinyStatDefinition[item.itemHash] || manifest.DestinyHistoricalStatsDefinition[item.itemHash] : item.type === 'modifier' ? manifest.DestinyActivityModifierDefinition[item.itemHash] : false;

    if (!definition) {
      return null;
    }

    if (definition.redacted) {
      return (
        <>
          <div className='acrylic' />
          <div className={cx('frame', 'common')}>
            <div className='header'>
              <div className='name'>{t('Classified')}</div>
              <div>
                <div className='kind'>{t('Insufficient clearance')}</div>
              </div>
            </div>
            <div className='black'>
              <div className='description'>
                <pre>{t('Keep it clean.')}</pre>
              </div>
            </div>
          </div>
        </>
      );
    }

    const Meat = item.type && woolworths[item.type];

    return (
      <>
        <div className='acrylic' />
        <div className={cx('frame', 'ui', item.rarity)}>
          <div className='header'>
            <div className='name'>{definition.displayProperties?.name || definition.statName}</div>
            {definition.itemTypeDisplayName ? <div className='kind'>{definition.itemTypeDisplayName}</div> : <div />}
          </div>
          <div className='black'>
            {this.props.viewport.width <= 600 && definition.screenshot ? (
              <div className='screenshot'>
                <ObservedImage className='image' src={`https://www.bungie.net${definition.screenshot}`} />
              </div>
            ) : null}
            {woolworths[item.type] ? <Meat {...member} {...item} /> : <Default {...member} {...item} />}
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport,
    tooltips: state.tooltips
  };
}

export default compose(connect(mapStateToProps), withTranslation())(UI);
