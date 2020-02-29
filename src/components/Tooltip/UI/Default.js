import React from 'react';

import manifest from '../../../utils/manifest';

const Default = (props) => {
  const { itemHash, type } = props;

  const definition = type === 'braytech' ? manifest.BraytechDefinition[itemHash] : type === 'stat' ? manifest.DestinyStatDefinition[itemHash] || manifest.DestinyHistoricalStatsDefinition[itemHash] : type === 'modifier' ? manifest.DestinyActivityModifierDefinition[itemHash] : false;

  // description
  const description = definition.displayProperties && definition.displayProperties.description !== '' && definition.displayProperties.description;

  return (
    <>
      {description ? (
        <div className='description'>
          <pre>{description}</pre>
        </div>
      ) : null}
    </>
  );
};

export default Default;
