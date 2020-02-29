import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import manifest from '../../../utils/manifest'

import './styles.css';

class Test extends React.Component {
  render() {
    const { t, member } = this.props;

    const characterProgressions = member.data.profile.characterProgressions.data;
    const characterRecords = member.data.profile.characterRecords.data;
    const profileRecords = member.data.profile.profileRecords.data.records;

    console.log(member.data.milestones && Object.values(member.data.milestones).map(m => ({name: manifest.DestinyMilestoneDefinition[m.milestoneHash].displayProperties.name, ...m, def: manifest.DestinyMilestoneDefinition[m.milestoneHash] })))

    return (
      <div className='user-module ranks'>
        
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
  connect(
    mapStateToProps
  ),
  withTranslation()
)(Test);
