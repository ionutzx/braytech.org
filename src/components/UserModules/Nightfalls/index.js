import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { orderBy } from 'lodash';

import manifest from '../../../utils/manifest';
import * as enums from '../../../utils/destinyEnums';
import Collectibles from '../../Collectibles';
import Records from '../../Records';
import ObservedImage from '../../ObservedImage';

import './styles.css';

class Nightfalls extends React.Component {
  render() {
    const { t, member } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    const weeklyNightfallStrikeActivities = characterActivities[member.characterId].availableActivities.filter(a => {
      if (!a.activityHash) return false;

      const definitionActivity = manifest.DestinyActivityDefinition[a.activityHash];

      if (definitionActivity && definitionActivity.activityModeTypes && definitionActivity.activityModeTypes.includes(46) && !definitionActivity.guidedGame && definitionActivity.modifiers && definitionActivity.modifiers.length > 2) return true;

      return false;
    });

    const weeklyNightfallStrikesOrdealHash = Object.keys(enums.nightfalls).find(k => enums.nightfalls[k].ordealHashes.find(o => weeklyNightfallStrikeActivities.find(w => w.activityHash === o)));
    const weeklyNightfallStrikesOrdealVersions = orderBy(weeklyNightfallStrikeActivities.filter(a => enums.nightfalls[weeklyNightfallStrikesOrdealHash].ordealHashes.includes(a.activityHash)) || [], [a => a.recommendedLight], ['asc']);

    const weeklyNightfallStrikesScored = weeklyNightfallStrikeActivities.filter(w => !Object.keys(enums.nightfalls).find(k => enums.nightfalls[k].ordealHashes.find(o => o === w.activityHash)));

    const stringNightfall = manifest.DestinyPresentationNodeDefinition[4213993861]?.displayProperties?.name;
    const stringNightfallOrdeal = manifest.DestinyPresentationNodeDefinition[656562339]?.displayProperties?.name;

    return [{ activityHash: weeklyNightfallStrikesOrdealHash, ordeal: true }].concat(weeklyNightfallStrikesScored).map((activity, a) => {
      const nightfall = manifest.DestinyActivityDefinition[activity.activityHash];

      const modifierHashes = (activity.ordeal ? weeklyNightfallStrikesOrdealVersions.find(a => a.recommendedLight === 980)?.modifierHashes : weeklyNightfallStrikeActivities.find(a => a.activityHash === activity.activityHash)?.modifierHashes) || [];

      return (
        <div key={nightfall.hash} className='column'>
          <div className='module'>
            <div className='sub-header'>
              <div>{activity.ordeal ? stringNightfallOrdeal : stringNightfall}</div>
            </div>
            <h3>{nightfall.selectionScreenDisplayProperties.name}</h3>
            <h4>{t('Active modifiers')}</h4>
            {modifierHashes.length ? (
              <ul className='list modifiers condensed'>
                {modifierHashes.map((hash, h) => {
                  const definitionModifier = manifest.DestinyActivityModifierDefinition[hash];

                  return (
                    <li key={h} className='tooltip' data-hash={hash} data-type='modifier'>
                      <div className='icon'>
                        <ObservedImage className='image' src={`https://www.bungie.net${definitionModifier.displayProperties.icon}`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className='info'>{t("Modifiers aren't available right now.")}</div>
            )}
            <h4>{t('Collectibles')}</h4>
            {enums.nightfalls[nightfall.hash]?.collectibles.length ? (
              <>
                <ul className='list collection-items'>
                  <Collectibles selfLinkFrom='/this-week' hashes={enums.nightfalls[nightfall.hash].collectibles} />
                </ul>
              </>
            ) : (
              <div className='info'>
                <p>
                  <em>{t("This Nightfall doesn't have any associated collectibles.")}</em>
                </p>
              </div>
            )}
            <h4>{t('Triumphs')}</h4>
            {enums.nightfalls[nightfall.hash]?.triumphs.length ? (
              <>
                <ul className='list record-items'>
                  <Records selfLinkFrom='/this-week' hashes={enums.nightfalls[nightfall.hash].triumphs} ordered />
                </ul>
              </>
            ) : (
              <div className='info'>
                <p>
                  <em>{t("This Nightfall doesn't have any associated records.")}</em>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(connect(mapStateToProps), withTranslation())(Nightfalls);
