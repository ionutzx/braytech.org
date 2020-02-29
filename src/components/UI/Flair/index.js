import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import * as enums from '../../../utils/destinyEnums';
import * as flair from '../../../utils/flair';

import { ReactComponent as ClovisBray } from '../../../svg/miscellaneous/clovis-bray.svg';
import { ReactComponent as Warmind } from '../../../svg/destinations/hellas-basin-1_monochrome.svg';
import { ReactComponent as Superintendent } from '../../../svg/miscellaneous/superintendent.svg';

import './styles.css';

const icons = {
  braytech: <ClovisBray />,
  veteran: <Warmind />,
  superintendent: <Superintendent />
};

function FlairPrimary({ id }) {
  const primary = flair.primaryFlair(id);

  if (!primary) {
    return null;
  }

  return (
    <div className={cx('flair', 'primary', primary.classNames)}>
      {icons[primary.icon]}
    </div>
  );
}

class Flair extends React.Component {
  componentDidMount() {
    this.props.rebindTooltips();
  }

  render() {
    const { type, id } = this.props;

    return (
      <div className='stamps'>
        <div className='tooltip' data-hash={`platform_${enums.platforms[type]}`} data-type='braytech'>
          <div className={cx('icon', `destiny-platform_${enums.platforms[type]}`)} />
        </div>
        {flair.stamps.map((stamp, s) => {
          if (stamp.condition(id)) {
            return (
              <div key={s} className='tooltip' data-hash={stamp.hash} data-type='braytech'>
                <div className={cx('icon', 'flair', stamp.classNames)}>{icons[stamp.icon]}</div>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

Flair = connect(mapStateToProps, mapDispatchToProps)(Flair);

export { Flair, FlairPrimary };

export default Flair;
