import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { ReactComponent as CurseCycle } from '../../../svg/miscellaneous/curse-cycle.svg';

import './styles.css';

class DreamingCityCurseCycle extends React.Component {
  render() {
    const { t, cycleInfo } = this.props;

    const rotation = {
      1: {
        strength: t('Lesser'),
      },
      2: {
        strength: t('Middling'),
      },
      3: {
        strength: t('Greater'),
      }
    };

    return (
      <div className='user-module dreaming-city-curse-cycle'>
        <div className='sub-header'>
          <div>{t("Savathûn's Curse")}</div>
        </div>
        <h3>{rotation[cycleInfo.week.curse].strength}</h3>
        <div className='text'>
          <p>{t('The Dreaming City is in stage {{week}} of its ongoing curse.', { week: cycleInfo.week.curse })}</p>
          <p><em>{t("Savathûn's Curse: implemented with Riven's dying breath and reset with every death of Dûl Incaru.")}</em></p>
        </div>
        <div className='icon'>
          <CurseCycle />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withTranslation()
)(DreamingCityCurseCycle);
