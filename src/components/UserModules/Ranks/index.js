import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Ranks from '../../Ranks';

import './styles.css';

class Module extends React.Component {
  render() {
    const { member, progressionHash = 2772425241 } = this.props;

    const characterProgressions = member.data.profile.characterProgressions.data;
    const characterRecords = member.data.profile.characterRecords.data;
    const profileRecords = member.data.profile.profileRecords.data.records;

    return (
      <div className='user-module ranks'>
        <Ranks hash={progressionHash} data={{ membershipType: member.membershipType, membershipId: member.membershipId, characterId: member.characterId, characters: member.data.profile.characters.data, characterProgressions, characterRecords, profileRecords }} />
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
)(Module);
