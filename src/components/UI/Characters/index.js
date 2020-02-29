import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import { fromNow } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';
import { removeMemberIds } from '../../../utils/paths';
import * as utils from '../../../utils/destinyUtils';
import ProgressBar from '../../UI/ProgressBar';
import Button from '../../../components/UI/Button';
import ObservedImage from '../../ObservedImage';
import { ReactComponent as SealTitleIcon } from '../../../svg/miscellaneous/seal-title.svg';

import './styles.css';

class Characters extends React.Component {
  render() {
    const { member, viewport, location, mini, colourised } = this.props;
    const characters = member.data.profile.characters;
    const characterActivities = member.data.profile.characterActivities;

    const lastActivities = utils.lastPlayerActivity({ profile: { characters, characterActivities } });

    const publicPaths = ['/maps', '/legend'];
    const goto = removeMemberIds((location && location.state?.from?.pathname) || '/now');

    return (
      <div className={cx('characters-list', { responsive: viewport.width < 1024, mini })}>
        {characters.data.map(character => {

          const progressSeasonalRank = utils.progressionSeasonRank(member);

          const lastActivity = lastActivities.find(a => a.characterId === character.characterId);

          const state = (
            <>
              <div className='activity'>{lastActivity.lastActivityString}</div>
              <time>{fromNow(lastActivity.lastPlayed)}</time>
            </>
          );

          const to = !publicPaths.includes(goto) ? `/${member.membershipType}/${member.membershipId}/${character.characterId}${goto}` : goto;

          const emblemPath = mini ? character.emblemPath : character.emblemBackgroundPath;
          
          return (
            <div key={character.characterId} className='char'>
              <Button
                className='linked'
                anchor
                to={to}
                action={this.props.onClickCharacter(character.characterId)}
              >
                <ObservedImage
                  className={cx('image', 'emblem', {
                    missing: !emblemPath
                  })}
                  src={`https://www.bungie.net${emblemPath || '/img/misc/missing_icon_d2.png'}`}
                />
                <div className='class'>{utils.classHashToString(character.classHash, character.genderType)}</div>
                <div className='species'>{utils.raceHashToString(character.raceHash, character.genderType)}</div>
                <div className='light'>{character.light}</div>
                <ProgressBar hideCheck {...progressSeasonalRank} />
              </Button>
              {character.titleRecordHash ? <div className={cx('title', { colourised })}>
                <div className='icon'>
                  <SealTitleIcon />
                </div>
                <div className='text'>{manifest.DestinyRecordDefinition[character.titleRecordHash].titleInfo.titlesByGenderHash[character.genderHash]}</div>
              </div> : null}
              <div className='state'>{state}</div>
            </div>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    viewport: state.viewport
  };
}

export default connect(mapStateToProps)(Characters);
