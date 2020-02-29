import React from 'react';

import { t } from '../../../utils/i18n';
import RecordsAlmost from '../../../components/RecordsAlmost';

class AlmostComplete extends React.Component {
  render() {
    const { sort } = this.props;

    return (
      <>
        <div className='almost-complete'>
          <div className='sub-header sub'>
            <div>{t('Almost complete')}</div>
          </div>
          <RecordsAlmost sort={sort} limit='200' selfLinkFrom='/triumphs/almost-complete' />
        </div>
      </>
    );
  }
}

export default AlmostComplete;
