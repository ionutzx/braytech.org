import React from 'react';

import manifest from '../../../utils/manifest';
import { getSubclassPathInfo } from '../../../utils/destinyUtils';

const Subclass = props => {
  const { itemHash, itemInstanceId, itemComponents } = props;

  const definitionItem = manifest.DestinyInventoryItemDefinition[itemHash];

  const subClassInfo = getSubclassPathInfo(itemComponents, { itemHash, itemInstanceId });

  // description as flair string
  const flair = definitionItem.displayProperties && definitionItem.displayProperties.description !== '' && definitionItem.displayProperties.description;

  return (
    <div className='background-overflow'>
      {subClassInfo ? (
        <div className='super'>
          <div className='path'>
            <div className='line' />
            <div className='text'>{subClassInfo.name}</div>
            <div className='line' />
          </div>
          <div className='ability'>
            <div className='text'>
              <div className='name'>{subClassInfo.super.name}</div>
              <div className='description'>
                <p>{subClassInfo.super.description}</p>
              </div>
            </div>
            <div className='icon'>{subClassInfo.super.icon}</div>
          </div>
        </div>
      ) : null}
      <div className='line' />
      <div className='flair'>
        <p>{flair}</p>
      </div>
    </div>
  );
};

export default Subclass;
