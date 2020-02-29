import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as enums from '../../../utils/destinyEnums';
import * as utils from '../../../utils/destinyUtils';
import Button from '../../UI/Button';
import ProgressBar from '../../UI/ProgressBar';
import Items from '../../Items';

import './styles.css';

class SeasonPass extends React.Component {
  constructor(props) {
    super(props);

    const { member, viewport } = this.props;
    const characterProgressions = member.data.profile.characterProgressions.data;

    const definitionSeason = manifest.DestinySeasonDefinition[manifest.settings.destiny2CoreSettings.currentSeasonHash];
    this.progressionHash = definitionSeason.seasonPassProgressionHash;

    this.state = {
      seasonPassRewardsPage: Math.ceil((Math.min(characterProgressions[member.characterId].progressions[this.progressionHash] && characterProgressions[member.characterId].progressions[this.progressionHash].level, 99) + 1) / this.seasonPassItemsPerPage(viewport.width))
    };
  }

  componentDidUpdate(p, s) {
    const { member, viewport } = this.props;
    const characterProgressions = member.data.profile.characterProgressions.data;

    if (s.seasonPassRewardsPage !== this.state.seasonPassRewardsPage) {
      this.props.rebindTooltips();
    }

    if ((p.member.data.profile.characterProgressions.data[p.member.characterId].progressions[this.progressionHash] && p.member.data.profile.characterProgressions.data[p.member.characterId].progressions[this.progressionHash].level) !== (characterProgressions[this.props.member.characterId].progressions[this.progressionHash] && characterProgressions[this.props.member.characterId].progressions[this.progressionHash].level)) {
      this.setState(p => ({
        ...p,
        seasonPassRewardsPage: Math.ceil((characterProgressions[this.props.member.characterId].progressions[this.progressionHash].level + 1) / this.seasonPassItemsPerPage(this.props.viewport.width))
      }));
    }

    if (p.viewport.width !== viewport.width) {
      this.setState(p => ({
        ...p,
        seasonPassRewardsPage: Math.ceil((Math.min(characterProgressions[member.characterId].progressions[this.progressionHash].level, 99) + 1) / this.seasonPassItemsPerPage(viewport.width))
      }));
    }
  }

  handler_seasonPassPrev = e => {
    this.setState(p => ({
      ...p,
      seasonPassRewardsPage: p.seasonPassRewardsPage - 1
    }));
  };

  handler_seasonPassNext = e => {
    this.setState(p => ({
      ...p,
      seasonPassRewardsPage: p.seasonPassRewardsPage + 1
    }));
  };

  seasonPassItemsPerPage = width => {
    if (width > 1280) return 10;
    if (width > 1024) return 8;
    if (width >= 768) return 5;
    if (width < 768) return 3;
    return 3;
  };

  render() {
    const { t, member, viewport } = this.props;
    const characters = member.data.profile.characters.data;
    const character = characters.find(c => c.characterId === member.characterId);
    const characterProgressions = member.data.profile.characterProgressions.data;
    const profile = member.data.profile.profile.data;

    // just in case
    if (!characterProgressions[member.characterId].progressions[this.progressionHash]) {
      return null;
    }

    const seasonPassItemsPerPage = this.seasonPassItemsPerPage(viewport.width);

    const seasonPass = {
      season: manifest.DestinySeasonDefinition[profile.currentSeasonHash],
      slice: this.state.seasonPassRewardsPage * seasonPassItemsPerPage - seasonPassItemsPerPage,
      itemsPerPage: seasonPassItemsPerPage,
      ranks: manifest.DestinyProgressionDefinition[this.progressionHash].steps.map((s, x) => {
        const rank = x + 1;
        const rewards = manifest.DestinyProgressionDefinition[this.progressionHash].rewardItems
          .map((r, i) => {
            return {
              ...r,
              state: enums.enumerateProgressionRewardItemState(characterProgressions[member.characterId].progressions[this.progressionHash].rewardItemStates[i])
            };
          })
          .filter((r, i) => r.rewardedAtProgressionLevel === rank);
        const rewardsFree = rewards
          .filter(r => r.uiDisplayStyle === 'free')
          .filter(i => {
            const definitionItem = manifest.DestinyInventoryItemDefinition[i.itemHash];

            // if package search contents
            if (definitionItem.itemCategoryHashes.includes(268598612)) {
              if (
                definitionItem.gearset &&
                definitionItem.gearset.itemList &&
                definitionItem.gearset.itemList.filter(t => {
                  const definitionItem = manifest.DestinyInventoryItemDefinition[t];

                  if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
                    return true;
                  } else {
                    return false;
                  }
                }).length
              ) {
                return false;
              } else {
                return true;
              }
            } else if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
              return false;
            } else {
              return true;
            }
          });
        const rewardsPremium = rewards
          .filter(r => r.uiDisplayStyle === 'premium')
          .filter(i => {
            const definitionItem = manifest.DestinyInventoryItemDefinition[i.itemHash];

            // if package, search contents
            if (definitionItem.itemCategoryHashes.includes(268598612)) {
              if (
                definitionItem.gearset &&
                definitionItem.gearset.itemList &&
                definitionItem.gearset.itemList.filter(t => {
                  const definitionItem = manifest.DestinyInventoryItemDefinition[t];

                  if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
                    return true;
                  } else {
                    return false;
                  }
                }).length
              ) {
                return false;
              } else {
                return true;
              }
            } else if (definitionItem.plug && definitionItem.plug.previewItemOverrideHash) {
              const definitionPreviewItem = manifest.DestinyInventoryItemDefinition[definitionItem.plug.previewItemOverrideHash];
              if (definitionPreviewItem.classType > -1 && definitionPreviewItem.classType < 3 && definitionPreviewItem.classType !== character.classType) {
                return false;
              } else {
                return true;
              }
            } else if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
              return false;
            } else {
              return true;
            }
          });

        return {
          rank,
          free: rewardsFree,
          premium: rewardsPremium
        };
      })
    };

    // console.log(seasonPass);

    const progressSeasonalRank = utils.progressionSeasonRank(member);

    return (
      <div className='season-pass'>
        <div className='module status'>
          <div className='sub-header'>
            <div>{t('Season pass')}</div>
          </div>
          <div className='text'>
            <div className='name'>{seasonPass.season.displayProperties.name}</div>
            <div className='description'>
              <p>{seasonPass.season.displayProperties.description}</p>
            </div>
          </div>
          <div className='rank'>{progressSeasonalRank.level}</div>
        </div>
        <div className='page'>
          <Button text={<i className='segoe-uniE973' />} action={this.handler_seasonPassPrev} disabled={this.state.seasonPassRewardsPage * seasonPassItemsPerPage - seasonPassItemsPerPage < 1} />
        </div>
        <div className='rewards'>
          {[...seasonPass.ranks, { filler: true }, { filler: true }].slice(seasonPass.slice, seasonPass.slice + seasonPass.itemsPerPage).map((r, i) => {
            const progressData = { ...characterProgressions[member.characterId].progressions[this.progressionHash] };

            if (r.filler) {
              return (
                <div key={i} className='rank filler'>
                  <div />
                  <div className='free' />
                  <div className='premium' />
                </div>
              );
            }

            if (progressData.level === progressData.levelCap) {
              progressData.nextLevelAt = 1000;
              progressData.progressToNextLevel = 1000;
            } else if (r.rank <= progressData.level) {
              progressData.progressToNextLevel = progressData.nextLevelAt;
            } else if (r.rank > progressData.level + 1) {
              progressData.progressToNextLevel = 0;
            }

            return (
              <div key={r.rank} className='rank' data-rank={r.rank}>
                <ProgressBar hideCheck {...progressData} />
                <div className={cx('free', { earned: r.free.length && r.free[0].state.earned, claimed: r.free.length && r.free[0].state.claimed, claimAllowed: r.free.length && r.free[0].state.claimAllowed })}>
                  <ul className='list inventory-items'>
                    {r.free.length ? (
                      <Items
                        items={r.free.map(r => {
                          return {
                            ...r,
                            state: null
                          };
                        })}
                      />
                    ) : null}
                  </ul>
                </div>
                <div className={cx('premium', { earned: r.premium.length && r.premium[0].state.earned, claimed: r.premium.length && r.premium[0].state.claimed, claimAllowed: r.premium.length && r.premium[0].state.claimAllowed })}>
                  <ul className='list inventory-items'>
                    {r.premium.length ? (
                      <Items
                        items={r.premium.map(r => {
                          return {
                            ...r,
                            state: null
                          };
                        })}
                      />
                    ) : null}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        <div className='page'>
          <Button text={<i className='segoe-uniE974' />} action={this.handler_seasonPassNext} disabled={seasonPass.slice + seasonPass.itemsPerPage >= 100} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(SeasonPass);
