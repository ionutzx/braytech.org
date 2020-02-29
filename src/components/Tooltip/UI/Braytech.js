import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import manifest from '../../../utils/manifest';

const Braytech = (props) => {
  const { t, itemHash, relatedHash } = props;

  const definition = manifest.BraytechDefinition[itemHash];

  // description
  const description = definition.displayProperties.description;

  return (
    <>
      {description ? (
        <div className='description'>
          <pre>{description}</pre>
        </div>
      ) : null}
      {itemHash === 'commonality' && relatedHash && manifest.statistics.triumphs[relatedHash] > 1 ? <div className='line' /> : null}
      {itemHash === 'commonality' && relatedHash && manifest.statistics.triumphs[relatedHash] > 1 ? (
        <div className='description'>
          <p>{t('{{players}} players have completed this.', { players: manifest.statistics.triumphs[relatedHash]?.toLocaleString() || 0 })}</p>
        </div>
      ) : null}
      {itemHash === 'commonality' ? <div className='line' /> : null}
      {itemHash === 'commonality' ? (
        <div className='description'>
          <p>{t('At current, {{players}} players are indexed by VOLUSPA.', { players: manifest.statistics.scrapes?.last?.members?.toLocaleString() })}</p>
        </div>
      ) : null}
    </>
  );
};

export default compose(
  withTranslation()
)(Braytech);