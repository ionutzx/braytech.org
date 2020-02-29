import React from 'react';

import { t, duration, timestampToDuration } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import ProgressBar from '../../UI/ProgressBar';

const Default = props => {
  const { itemHash, itemInstanceId, itemComponents, quantity, vendorHash, vendorItemIndex } = props;

  const definitionItem = manifest.DestinyInventoryItemDefinition[itemHash];

  // description
  const description = definitionItem.displayProperties && definitionItem.displayProperties.description !== '' && definitionItem.displayProperties.description;

  // source string
  const sourceString = definitionItem.collectibleHash ? manifest.DestinyCollectibleDefinition[definitionItem.collectibleHash] && manifest.DestinyCollectibleDefinition[definitionItem.collectibleHash].sourceString : false;

  // flair string
  const flair = definitionItem.displaySource && definitionItem.displaySource !== '' && definitionItem.displaySource;

  const objectives = [];
  const rewards = [];

  const expirationDate = itemComponents && itemComponents.item && itemComponents.item.expirationDate;
  const timestamp = expirationDate && new Date().getTime();
  const timestampExpiry = expirationDate && new Date(expirationDate).getTime();

  // item objectives
  definitionItem.objectives &&
    definitionItem.objectives.objectiveHashes.forEach(hash => {
      const definitionObjective = manifest.DestinyObjectiveDefinition[hash];

      const instanceProgressObjective = itemComponents?.objectives?.length && itemComponents.objectives.find(o => o.objectiveHash === hash);

      let playerProgress = {
        complete: false,
        progress: 0,
        objectiveHash: definitionObjective.hash
      };

      playerProgress = { ...playerProgress, ...instanceProgressObjective };

      objectives.push(<ProgressBar key={definitionObjective.hash} objectiveHash={definitionObjective.hash} {...playerProgress} />);
    });

  // potential rewards
  definitionItem.value &&
    definitionItem.value.itemValue.forEach(value => {
      if (value.itemHash !== 0) {
        const definitionReward = manifest.DestinyInventoryItemDefinition[value.itemHash];

        rewards.push(
          <li key={value.itemHash}>
            <div className='icon'>{definitionReward.displayProperties.icon && <ObservedImage className='image' src={`https://www.bungie.net${definitionReward.displayProperties.icon}`} />}</div>
            <div className='text'>
              {definitionReward.displayProperties.name}
              {value.quantity > 1 ? <> +{value.quantity}</> : null}
            </div>
          </li>
        );
      }
    });

  // vendor costs
  const vendorCosts = vendorHash && vendorItemIndex && manifest.DestinyVendorDefinition[vendorHash]?.itemList[vendorItemIndex]?.currencies;

  const blocks = [];

  // flair
  if (flair) {
    blocks.push(
      <div className='flair'>
        <p>{flair}</p>
      </div>
    );
  }

  if (flair && description) blocks.push(<div className='line' />);

  // description
  if (description) {
    blocks.push(
      <div className='description'>
        <pre>{description}</pre>
      </div>
    );
  }

  // objectives?
  if (objectives.length) {
    blocks.push(<div className='objectives'>{objectives}</div>);
  }

  // objectives?
  if (rewards.length) {
    blocks.push(
      <div className='rewards'>
        <div>{t('Rewards')}</div>
        <ul>{rewards}</ul>
      </div>
    );
  }

  // instance expiry
  if (itemComponents?.objectives?.length && itemComponents.objectives.filter(o => !o.complete).length > 0 && expirationDate) {
    blocks.push(
      <div className='expiry'>
        {timestampExpiry > timestamp ? (
          <>
            {t('Expires in {{duration}}.', { duration: duration(timestampToDuration(expirationDate)) })}
          </>
        ) : (
          <>{t('Expired.')}</>
        )}
      </div>
    );
  }

  // quantity
  if (quantity && definitionItem.inventory && definitionItem.inventory.maxStackSize > 1 && quantity === definitionItem.inventory.maxStackSize) {
    blocks.push(
      <div className='quantity'>
        {t('Quantity')}: <span>{quantity}</span> <span className='max'>({t('max')})</span>
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

export default Default;
