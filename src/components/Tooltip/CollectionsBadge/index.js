import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as enums from '../../../utils/destinyEnums';
import * as utils from '../../../utils/destinyUtils';

import './styles.css';

class CollectionsBadge extends React.Component {
  render() {
    const { t, member, hash } = this.props;

    const characterCollectibles = member.data.profile.characterCollectibles.data;
    const profileCollectibles = member.data.profile.profileCollectibles.data;
    const characters = member.data.profile.characters.data;
    const character = characters.find(c => c.characterId === member.characterId);

    const definitionBadge = manifest.DestinyPresentationNodeDefinition[hash];

    if (!definitionBadge) {
      console.warn('Hash not found');
      return null;
    }

    if (definitionBadge.redacted) {
      return (
        <>
          <div className='acrylic' />
          <div className={cx('frame', 'common')}>
            <div className='header'>
              <div className='name'>{t('Classified')}</div>
              <div>
                <div className='kind'>{t('Insufficient clearance')}</div>
              </div>
            </div>
            <div className='black'>
              <div className='description'>
                <pre>{t('Keep it clean.')}</pre>
              </div>
            </div>
          </div>
        </>
      );
    } else {

      let classStates = [];
      definitionBadge.children.presentationNodes.forEach(node => {
        let definitionNode = manifest.DestinyPresentationNodeDefinition[node.presentationNodeHash];

        let classState = [];
        definitionNode.children.collectibles.forEach(child => {
          let scope = profileCollectibles.collectibles[child.collectibleHash] ? profileCollectibles.collectibles[child.collectibleHash] : characterCollectibles[member.characterId].collectibles[child.collectibleHash];
          if (scope) {
            classState.push(scope.state);
          }
        });

        classStates.push({
          class: enums.classStrings[enums.associationsCollectionsBadgesClasses[definitionNode.hash]],
          name: definitionNode.displayProperties.name,
          states: classState
        });
      });

      let completed = 0;
      const classTotal = classStates.reduce((a, obj) => {
        return Math.max(a, obj.states.filter(collectible => !enums.enumerateCollectibleState(collectible).invisible).length);
      }, 0);

      const progress = classStates.map((obj, i) => {
        if (obj.states.filter(collectible => !enums.enumerateCollectibleState(collectible).notAcquired).length === classTotal) {
          completed++;
        }

        return (
          <div key={i} className='progress'>
            <div className='class-icon'>
              <span className={`destiny-class_${obj.class}`} />
            </div>
            <div className='text'>
              <div className='title'>{obj.name}</div>
              <div className='fraction'>
                {obj.states.filter(collectible => !enums.enumerateCollectibleState(collectible).notAcquired).length}/{classTotal}
              </div>
            </div>
            <div
              className={cx('bar', {
                completed: obj.states.filter(collectible => !enums.enumerateCollectibleState(collectible).notAcquired).length === classTotal
              })}
            >
              <div
                className='fill'
                style={{
                  width: `${(obj.states.filter(collectible => !enums.enumerateCollectibleState(collectible).notAcquired).length / classTotal) * 100}%`
                }}
              />
            </div>
          </div>
        );
      });

      return (
        <>
          <div className='acrylic' />
          <div className={cx('frame', 'ui', 'collections-badge')}>
            <div className='header'>
              <div className='name'>{definitionBadge.displayProperties.name}</div>
              <div>
                <div className='kind'>{t('Badge')}</div>
              </div>
            </div>
            <div className='black'>
              <div className='flair'>
                <p>{definitionBadge.displayProperties.description}</p>
              </div>
              <div className='line' />
              <div className={cx('state', { completed })}>
                <div className='text'>{completed > 0 ? t('Badge completed') : t('Badge progress')}</div>
                {progress}
              </div>
            </div>
          </div>
        </>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(connect(mapStateToProps), withTranslation())(CollectionsBadge);
