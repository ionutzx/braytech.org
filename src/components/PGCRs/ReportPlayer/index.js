import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as bungie from '../../../utils/bungie';
import Spinner from '../../UI/Spinner';
import { Button } from '../../UI/Button';

import './styles.css';

class ReportPlayer extends React.Component {
  state = {};

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
  }

  render() {
    const { t } = this.props;

    return (
      <div className='report-player'>
        <Button text={t('Report player')} />
      </div>
    );
  }
}

export default compose(withTranslation())(ReportPlayer);
