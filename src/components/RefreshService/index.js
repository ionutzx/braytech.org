import React from 'react';
import { connect } from 'react-redux';

import getMember from '../../utils/getMember';

const AUTO_REFRESH_INTERVAL = 30 * 1000;
const TIMEOUT = 60 * 60 * 1000;

class RefreshService extends React.Component {
  componentDidMount() {
    // start the countdown
    this.init();
  }

  componentDidUpdate(prevProps) {
    // if previous member prop data doesn't equal current member prop data, if config service was turned off/on
    if (prevProps.member.data !== this.props.member.data || this.props.member.stale) {
      // member data is stale -> go now
      if (this.props.member.stale) {
        this.track();
        this.service();

        // restart the countdown
      } else {
        this.clearInterval();
        this.startInterval();
      }
    }
  }

  componentWillUnmount() {
    this.quit();
  }

  render() {
    return null;
  }

  init() {
    if (this.props.member.membershipId) {
      this.track();

      document.addEventListener('click', this.handler_click);
      document.addEventListener('visibilitychange', this.handler_visibility);

      this.startInterval();
    }
  }

  quit() {
    document.removeEventListener('click', this.handler_click);
    document.removeEventListener('visibilitychange', this.handler_visibility);

    this.clearInterval();
  }

  track() {
    this.lastActivityTimestamp = Date.now();
  }

  activeWithinTimespan(timespan) {
    return Date.now() - this.lastActivityTimestamp <= timespan;
  }

  startInterval() {
    this.refreshAccountDataInterval = window.setInterval(this.service, AUTO_REFRESH_INTERVAL);
  }

  clearInterval() {
    window.clearInterval(this.refreshAccountDataInterval);
  }

  handler_click = () => {
    this.track();
  };

  handler_visibility = () => {
    if (document.hidden === false) {
      this.track();
      this.service();
    }
  };

  service = async () => {

    // service is already asking for fresh data
    if (this.props.refresh.loading) {
      return;
    }

    // user has been inactive for TIMEOUT so we'll stop pinging the API
    if (!this.activeWithinTimespan(TIMEOUT)) {
      return;
    }

    const { membershipType, membershipId, characterId, data: previousMemberLoad } = this.props.member;
      
    this.props.setState(true);

    try {

      const data = await getMember(membershipType, membershipId, true);

      ['profile', 'groups'].forEach(key => {
        if (data[key].ErrorCode !== 1) {
          throw new Error(data[key].ErrorCode);
        }
      });

      if (data) {
        this.props.setMember({
          membershipType,
          membershipId,
          characterId,
          data: {
            profile: data.profile.Response,
            groups: data.groups.Response,
            milestones: data.milestones?.ErrorCode === 1 ? data.milestones.Response : previousMemberLoad.milestones
          }
        });
      }
    } catch (e) {
      console.warn(`Error while refreshing profile - ignoring`, e);
    }

    this.props.setState(false);
  };
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    refresh: state.refresh
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setMember: payload => {
      dispatch({ type: 'MEMBER_LOADED', payload });
    },
    setState: loading => {
      dispatch({ type: 'SET_REFRESH_STATE', payload: { loading } });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RefreshService);
