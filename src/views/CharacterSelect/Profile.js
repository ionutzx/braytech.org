import React from 'react';

import { t } from '../../utils/i18n';
import * as utils from '../../utils/destinyUtils';
import Characters from '../../components/UI/Characters';
import Flair from '../../components/UI/Flair';

class Profile extends React.Component {
  render() {
    const { member, location } = this.props;

    const groups = member.data.groups.results;

    const timePlayed = Math.floor(
      Object.keys(member.data.profile.characters.data).reduce((sum, key) => {
        return sum + parseInt(member.data.profile.characters.data[key].minutesPlayedTotal, 10);
      }, 0) / 1440
    );

    return (
      <div className='user'>
        <div className='summary'>
          <div className='displayName'>{member.data.profile.profile.data.userInfo.displayName}</div>
          {groups.length === 1 && <div className='clan'>{groups[0].group.name}</div>}
          <Flair type={member.membershipType} id={member.membershipId} />
          <div className='basics'>
            <div>
              <div className='value'>{utils.progressionSeasonRank(member).level}</div>
              <div className='name'>{t('Season rank')}</div>
            </div>
            <div>
              <div className='value'>
                {timePlayed === 1 ? t('1 day played') : t('{{timePlayed}} days played', { timePlayed })}
              </div>
              <div className='name'>{t('Time played across characters')}</div>
            </div>
            <div>
              <div className='value'>{member.data.profile.profileRecords.data.score.toLocaleString()}</div>
              <div className='name'>{t('Triumph score')}</div>
            </div>
            <div>
              <div className='value'>{utils.collectionTotal(member.data.profile).toLocaleString()}</div>
              <div className='name'>{t('Collection total')}</div>
            </div>
          </div>
        </div>
        <Characters member={member} location={location} onClickCharacter={this.props.onClickCharacter} />
      </div>
    );
  }
}

export default Profile;
