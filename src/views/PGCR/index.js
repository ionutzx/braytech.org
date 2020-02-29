import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import getPGCR from '../../utils/getPGCR';

import { ReportItem } from '../../components/PGCRs/PGCR';
import Spinner from '../../components/UI/Spinner';

import './styles.css';

class PGCR extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.init();

    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  init = async () => {
    const { member, match } = this.props;
    const { instanceId } = match.params;

    const membershipId = (member && member.membershipId) || '343';

    const result = await this.getReport(membershipId, instanceId);

    console.log(result);

    if (this.mounted) {
      this.setState(p => ({
        loading: false,
        membershipId
      }));
    }
  };

  getReport = async (membershipId, instanceId) => {

    if (this.props.pgcr[membershipId] && !this.props.pgcr[membershipId].find(pgcr => pgcr.activityDetails.instanceId === instanceId)) {
      return getPGCR(membershipId, instanceId);
    } else if (!this.props.pgcr[membershipId] && instanceId) {
      return getPGCR(membershipId, instanceId);
    } else {
      ////////// ??
      return true;
    }
  };

  render() {
    const { pgcr, match } = this.props;
    const { instanceId } = match.params;

    const { loading, membershipId } = this.state;

    const report = !loading && pgcr[membershipId] && pgcr[membershipId].find(pgcr => pgcr.activityDetails.instanceId === instanceId);

    console.log(report);

    if (loading) {
      return (
        <div className='view loading' id='pgcr'>
          <Spinner />
        </div>
      );
    } else if (report) {
      return (
        <div className='view' id='pgcr'>
          <ul className='list reports'>
            <ReportItem report={report} expanded />
          </ul>
        </div>
      );
    } else {
      return (
        <div className='view' id='pgcr'>
          error
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    pgcr: state.pgcr
  };
}

export default compose(
  connect(mapStateToProps),
  withTranslation()
)(PGCR);
