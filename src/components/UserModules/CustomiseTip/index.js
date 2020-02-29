import React from 'react';
import { withTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

import DismissTip from '../../UI/DismissTip';
import { ReactComponent as Info } from '../../../svg/miscellaneous/info.svg';

import './styles.css';

class CustomiseTip extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <div className='wrap'>
        <div className='icon'>
          <Info />
        </div>
        <Markdown className='text' source={t("Did you know? You can customise the displayed modules by tapping _Customise_ in the bottom right.")} />
        <DismissTip value='CustomiseTipModule' />
      </div>
    );
  }
}

export default withTranslation()(CustomiseTip);