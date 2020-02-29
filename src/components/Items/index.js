import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { orderBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import * as enums from '../../utils/destinyEnums';
import { itemComponents } from '../../utils/destinyItems/itemComponents';
import { sockets } from '../../utils/destinyItems/sockets';
import { stats } from '../../utils/destinyItems/stats';
import { masterwork } from '../../utils/destinyItems/masterwork';
import ObservedImage from '../../components/ObservedImage';
import ProgressBar from '../../components/UI/ProgressBar';
import { ReactComponent as TrackingIcon } from '../../svg/miscellaneous/tracking.svg';

import './styles.css';

class Items extends React.Component {
  handler = item => e => {
    const { handler } = this.props;

    if (handler) {
      handler(item);
    }
  }

  render() {
    const { member, items, order, noBorder, hideQuantity, asPanels, showHash, inspect } = this.props;

    let output = [];

    if (!items || !items.length) {
      console.warn('No items specified');
      return null;
    }

    items.forEach((item, i) => {
      const definitionItem = item?.itemHash && (manifest.DestinyInventoryItemDefinition[item.itemHash] || manifest.BraytechDefinition[item.itemHash]);

      if (!definitionItem) {
        console.log(`Items: Couldn't find item definition for:`, item);
        return null;
      }

      item.itemComponents = itemComponents(item, member);
      item.sockets = sockets(item);
      item.stats = stats(item);
      item.masterwork = masterwork(item);

      const bucketsToExcludeFromInstanceProgressDisplay = [
        4274335291 // Emblems
      ];

      const vendorItemStatus = item.unavailable === undefined && item.saleStatus && enums.enumerateVendorItemStatus(item.saleStatus);

      const masterworked = enums.enumerateItemState(item.state).masterworked || (!item.itemInstanceId && (definitionItem.itemType === enums.DestinyItemType.Armor ? item.masterwork?.stats?.filter(s => s.value > 9).length : item.masterwork?.stats?.filter(s => s.value >= 9).length));
      const tracked = enums.enumerateItemState(item.state).tracked;

      output.push({
        name: definitionItem.displayProperties && definitionItem.displayProperties.name,
        tierType: definitionItem.inventory && definitionItem.inventory.tierType,
        el: (
          <li
            key={i}
            className={cx(
              {
                tooltip: !this.props.disableTooltip,
                linked: true,
                masterworked,
                tracked,
                exotic: definitionItem.inventory && definitionItem.inventory.tierType === 6,
                'no-border': (definitionItem.uiItemDisplayStyle === 'ui_display_style_engram' && item.bucketHash !== 3284755031) || (definitionItem.itemCategoryHashes && definitionItem.itemCategoryHashes.includes(268598612)) || (definitionItem.itemCategoryHashes && definitionItem.itemCategoryHashes.includes(18)) || noBorder,
                unavailable: (vendorItemStatus && !vendorItemStatus.success) || item.unavailable
              },
              `item-type-${definitionItem.itemType || 0}`
            )}
            data-hash={item.itemHash}
            data-instanceid={item.itemInstanceId}
            data-state={item.state}
            data-vendorhash={item.vendorHash}
            data-vendoritemindex={item.vendorItemIndex}
            data-vendorstatus={item.saleStatus}
            data-quantity={item.quantity && item.quantity > 1 ? item.quantity : null}
            onClick={this.handler(item)}
          >
            <div className='icon'>
              <ObservedImage className='image' src={definitionItem.displayProperties.localIcon ? `${definitionItem.displayProperties.icon}` : `https://www.bungie.net${definitionItem.displayProperties.icon}`} />
            </div>
            {tracked ? (
              <div className='track'>
                <TrackingIcon />
              </div>
            ) : null}
            {asPanels ? (
              <div className='text'>
                <div className='name'>{definitionItem.displayProperties.name}</div>
                {showHash ? <div className='hash'>{definitionItem.hash}</div> : null}
              </div>
            ) : null}
            {item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length > 0 && !bucketsToExcludeFromInstanceProgressDisplay.includes(item.bucketHash) ? (
              <ProgressBar
                progress={{
                  progress: item.itemComponents?.objectives.reduce((acc, curr) => {
                    return acc + curr.progress;
                  }, 0),
                  objectiveHash: item.itemComponents?.objectives[0].objectiveHash
                }}
                objective={{
                  completionValue: item.itemComponents?.objectives.reduce((acc, curr) => {
                    return acc + curr.completionValue;
                  }, 0)
                }}
                hideCheck
              />
            ) : null}
            {!hideQuantity && item.quantity && item.quantity > 1 ? <div className={cx('quantity', { 'max-stack': definitionItem.inventory && definitionItem.inventory.maxStackSize === item.quantity })}>{item.quantity}</div> : null}
            {inspect && definitionItem.itemHash ? <Link to={{ pathname: `/inspect/${definitionItem.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
          </li>
        )
      });
    });

    output = order ? orderBy(output, [i => i[order], i => i.name], ['desc', 'asc']) : output;

    return output.map(i => i.el);
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(Items);
