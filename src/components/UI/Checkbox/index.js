import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';

import './styles.css';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { classNames, checked, text, children, linked, action, disabled = false } = this.props;

    return (
      <div
        className={cx('check-box', classNames, { checked: checked, linked: linked, disabled: disabled })}
        onClick={e => {
          if (action && !disabled) {
            action(e);
          }
        }}
      >
        <div className={cx('check', { ed: checked })} />
        {!children ? <div className='text'>{text}</div> : children}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {};
}

export default compose(connect(mapStateToProps))(Checkbox);
