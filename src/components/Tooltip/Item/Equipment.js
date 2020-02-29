import React from 'react';
import i18n from 'i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as enums from '../../../utils/destinyEnums';
import { damageTypeToAsset, ammoTypeToAsset, breakerTypeToIcon, energyTypeToAsset, energyStatToType, stringToIcons } from '../../../utils/destinyUtils';
import { getSocketsWithStyle, getModdedStatValue, getSumOfArmorStats } from '../../../utils/destinyItems/utils';
import { statsMs } from '../../../utils/destinyItems/stats';
import ObservedImage from '../../ObservedImage';

const Equipment = props => {
  const { itemHash, itemComponents, primaryStat, stats, sockets, masterwork, vendorHash, vendorItemIndex } = props;

  const definitionItem = manifest.DestinyInventoryItemDefinition[itemHash];

  // description as flair string
  const flair = definitionItem.displayProperties && definitionItem.displayProperties.description !== '' && definitionItem.displayProperties.description;

  // source string
  const sourceString = definitionItem.collectibleHash ? manifest.DestinyCollectibleDefinition[definitionItem.collectibleHash] && manifest.DestinyCollectibleDefinition[definitionItem.collectibleHash].sourceString : false;

  // vendor costs
  const vendorCosts = vendorHash && vendorItemIndex && manifest.DestinyVendorDefinition[vendorHash]?.itemList[vendorItemIndex]?.currencies;

  // weapon damage type
  let damageTypeHash = definitionItem.itemType === enums.DestinyItemType.Weapon && definitionItem.damageTypeHashes[0];
  damageTypeHash = itemComponents && itemComponents.instance ? itemComponents.instance.damageTypeHash : damageTypeHash;

  const displayStats = (stats && stats.length && !stats.find(s => s.statHash === -1000)) || (stats && stats.length && stats.find(s => s.statHash === -1000 && s.value !== 0));
  const displaySockets = sockets && sockets.socketCategories && sockets.sockets.filter(s => (s.isPerk || s.isIntrinsic || s.isMod || s.isOrnament) && !s.isTracker && !s.isShader && s.plug?.plugItem).length;

  const armor2MasterworkSockets = sockets && sockets.socketCategories && getSocketsWithStyle(sockets, enums.DestinySocketCategoryStyle.EnergyMeter);

  const energy =
    definitionItem.itemType === enums.DestinyItemType.Armor &&
    ((itemComponents && itemComponents.instance && itemComponents.instance.energy) ||
      (masterwork &&
        armor2MasterworkSockets.length && {
          energyTypeHash: energyStatToType(masterwork.stats[0].hash),
          energyCapacity: masterwork.stats[0].value
        }));
  const definitionEnergy = energy && energyTypeToAsset(energy.energyTypeHash);

  const blocks = [];

  // primary stat block for weapons and armor
  if (primaryStat) {
    if (definitionItem.itemType === enums.DestinyItemType.Weapon) {
      blocks.push(
        <>
          <div className='damage weapon'>
            <div className={cx('power', damageTypeToAsset(damageTypeHash)?.string)}>
              {definitionItem.breakerType > 0 && <div className='breaker-type'>{breakerTypeToIcon(definitionItem.breakerTypeHash)}</div>}
              <div className={cx('icon', damageTypeToAsset(damageTypeHash)?.string)} />
              <div className='text'>{primaryStat.value}</div>
            </div>
            <div className='slot'>
              <div className={cx('icon', `ammo-type-${definitionItem.equippingBlock.ammoType}`)} />
              <div className='text'>{ammoTypeToAsset(definitionItem.equippingBlock.ammoType).string}</div>
            </div>
          </div>
        </>
      );
    } else {
      blocks.push(
        <>
          <div className='damage armour'>
            <div className='power'>
              <div className='text'>{primaryStat.value}</div>
              <div className='text'>{primaryStat.displayProperties.name}</div>
            </div>
            {energy ? (
              <div className='energy'>
                <div className={cx('value', definitionEnergy.string)}>
                  <div className='icon'>{definitionEnergy.icon}</div> {energy.energyCapacity}
                </div>
                <div className='text'>{i18n.t('Energy')}</div>
              </div>
            ) : null}
          </div>
        </>
      );
    }
  }

  if (primaryStat && flair) blocks.push(<div className='line' />);

  // flair
  if (flair) {
    blocks.push(
      <div className='flair'>
        <p>{flair}</p>
      </div>
    );
  }

  if ((primaryStat && displayStats) || (flair && displayStats) || (flair && !displayStats && displaySockets)) blocks.push(<div className='line' />);

  if (masterwork?.objective?.progress) {
    blocks.push(
      <div className='kill-tracker'>
        <div className='text'>
          <div>{masterwork.objective.typeDesc}</div>
          <div>{masterwork.objective.progress.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  if (masterwork?.objective?.progress && displayStats) blocks.push(<div className='line' />);

  // stats
  if (displayStats) {
    blocks.push(
      <div className='stats'>
        {stats.map(s => {
          // map through stats

          const armor2MasterworkValue = armor2MasterworkSockets && getSumOfArmorStats(armor2MasterworkSockets, [s.statHash]);

          const moddedValue = sockets && sockets.sockets && getModdedStatValue(sockets, s);
          const masterworkValue = (masterwork && masterwork.stats?.find(m => m.hash === s.statHash) && masterwork.stats?.find(m => m.hash === s.statHash).value) || armor2MasterworkValue || 0;

          let baseBar = s.value;

          if (moddedValue) {
            baseBar -= moddedValue;
          }

          if (masterworkValue) {
            baseBar -= masterworkValue;
          }

          const segments = [[baseBar]];

          if (moddedValue) {
            segments.push([moddedValue, 'modded']);
          }

          if (masterworkValue) {
            segments.push([masterworkValue, 'masterwork']);
          }

          return (
            <div key={s.statHash} className='stat'>
              <div className='name'>{s.statHash === -1000 ? i18n.t('Total') : s.displayProperties.name}</div>
              <div className={cx('value', { bar: s.bar })}>
                {s.bar ? (
                  <>
                    {segments.map(([value, className], i) => (
                      <div key={i} className={cx('bar', className)} data-value={value} style={{ width: `${Math.min(100, Math.floor(100 * (value / s.maximumValue)))}%` }} />
                    ))}
                    <div className='int'>{s.value}</div>
                  </>
                ) : (
                  <div className={cx('text', { masterwork: masterworkValue !== 0 })}>
                    {s.value} {statsMs.includes(s.statHash) && 'ms'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (displayStats && displaySockets) blocks.push(<div className='line' />);

  if (displaySockets) {
    blocks.push(
      <div
        className={cx('sockets', {
          // styling for single plug sockets
          one:
            sockets.sockets
              .filter(s => (s.isPerk || s.isIntrinsic || s.isMod || s.isOrnament) && !s.isTracker && !s.isShader && s.plug?.plugItem)
              .map(s => s.plugOptions && s.plugOptions.filter(p => p.isEnabled))
              .filter(s => s.length).length === 1
        })}
      >
        {sockets.socketCategories
          .map((c, i) => {
            // map through socketCategories

            if (c.sockets.length) {
              const plugs = c.sockets.filter(s => (s.isPerk || s.isIntrinsic || s.isMod || s.isOrnament) && !s.isTracker && !s.isShader && s.plug?.plugItem);

              if (plugs.length) {
                return (
                  <div key={c.category.hash} className='category'>
                    {plugs.map(s => {
                      // filter for perks and map through sockets

                      return (
                        <div key={s.socketIndex} className='socket'>
                          {s.plugOptions
                            .filter(p => p.isEnabled && p.plugItem?.hash === s.plug.plugItem?.hash)
                            .map(p => {
                              // filter for enabled plugs and map through

                              return (
                                <div key={p.plugItem.hash} className={cx('plug', { intrinsic: s.isIntrinsic, enabled: true })}>
                                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${p.plugItem.displayProperties.icon ? p.plugItem.displayProperties.icon : `/img/misc/missing_icon_d2.png`}`} />
                                  <div className='text'>
                                    <div className='name'>{p.plugItem.displayProperties.name}</div>
                                    <div className='description'>{stringToIcons(s.isIntrinsic ? p.plugItem.displayProperties.description : p.plugItem.itemTypeDisplayName)}</div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                return false;
              }
            } else {
              return false;
            }
          })
          .filter(c => c)}
      </div>
    );
  }

  if (sourceString) blocks.push(<div className='line' />);

  // sourceString
  if (sourceString) {
    blocks.push(
      <div className='source'>
        <p>{sourceString}</p>
      </div>
    );
  }

  if ((sourceString && vendorCosts?.length) || vendorCosts?.length) blocks.push(<div className='line' />);

  // vendor costs
  if (vendorCosts?.length) {
    blocks.push(
      <div className='vendor-costs'>
        <ul>
          {vendorCosts.map((cost, c) => (
            <li key={c}>
              <ul>
                <li>
                  <ObservedImage className='image icon' src={`https://www.bungie.net${manifest.DestinyInventoryItemDefinition[cost.itemHash]?.displayProperties.icon}`} />
                  <div className='text'>{manifest.DestinyInventoryItemDefinition[cost.itemHash]?.displayProperties.name}</div>
                </li>
                <li>{cost.quantity.toLocaleString()}</li>
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return blocks.map((b, i) => <React.Fragment key={i}>{b}</React.Fragment>);
};

export default Equipment;
