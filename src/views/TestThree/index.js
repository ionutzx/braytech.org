import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import manifest from '../../utils/manifest';

import Scene from '../../components/Three/Inspect/Scene';

import './styles.css';

class TestThree extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentDidMount() {
    this.mounted = true;
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { t } = this.props;

    return (
      <div className='view' id='three'>
        <Scene />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {};
}

export default compose(connect(mapStateToProps), withTranslation())(TestThree);
