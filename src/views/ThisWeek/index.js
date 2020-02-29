import React from 'react';
import cx from 'classnames';

import View from './View';
import Customise from './Customise';

import './styles.css';

const views = {
  default: {
    name: '',
    component: View
  },
  customise: {
    name: 'customise',
    component: Customise
  }
};

class ThisWeek extends React.Component {
  render() {
    const view = (this.props.match.params.view && views[this.props.match.params.view] && this.props.match.params.view) || 'default';

    let ViewComponent = views[view].component;

    return (
      <div className={cx('view', views[view].name)} id='this-week'>
        <ViewComponent {...this.props} />
      </div>
    );
  }
}

export default ThisWeek;
