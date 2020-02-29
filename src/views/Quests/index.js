import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { orderBy, groupBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import * as enums from '../../utils/destinyEnums';
import * as bungie from '../../utils/bungie';
import { itemComponents } from '../../utils/destinyItems/itemComponents';
import ObservedImage from '../../components/ObservedImage';
import { NoAuth, DiffProfile } from '../../components/BungieAuth';
import { ProfileLink } from '../../components/ProfileLink';
import QuestLine from '../../components/QuestLine';
import Spinner from '../../components/UI/Spinner';
import ProgressBar from '../../components/UI/ProgressBar';
import { DestinyKey } from '../../components/UI/Button';
import { ReactComponent as TrackingIcon } from '../../svg/miscellaneous/tracking.svg';

import './styles.css';

class Quests extends React.Component {
  async componentDidMount() {
    window.scrollTo(0, 0);

    this.props.rebindTooltips();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hash !== this.props.hash) {
      window.scrollTo(0, 0);

      this.props.rebindTooltips();
    }
  }

  process = (items = [], isQuest = false, enableTooltip = true) => {
    const { member, viewport } = this.props;

    const nowMs = new Date().getTime();

    return items
      .map((item, i) => {
        const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];
        const definitionBucket = item.bucketHash ? manifest.DestinyInventoryBucketDefinition[item.bucketHash] : false;

        if (!definitionItem) {
          console.log(`Items: Couldn't find item definition for ${item.itemHash}`);
          return false;
        }

        item.itemComponents = itemComponents(item, member);

        const expiryMs = item.expirationDate && new Date(item.expirationDate).getTime();

        const bucketName = definitionBucket?.displayProperties?.name?.replace(' ', '-').toLowerCase();

        const vendorSource = definitionItem.sourceData?.vendorSources?.length && definitionItem.sourceData.vendorSources[0] && definitionItem.sourceData.vendorSources[0].vendorHash;

        const masterworked = enums.enumerateItemState(item.state).masterworked;
        const tracked = enums.enumerateItemState(item.state).tracked;

        return {
          ...item,
          name: definitionItem.displayProperties?.name,
          rarity: definitionItem.inventory?.tierType,
          vendorSource,
          expiryMs: expiryMs || 10000 * 10000 * 10000 * 10000,
          el: (
            <li
              key={item.itemHash}
              className={cx(
                {
                  linked: true,
                  masterworked,
                  tracked,
                  tooltip: (enableTooltip && viewport.width > 600) || (enableTooltip && !isQuest),
                  exotic: definitionItem.inventory?.tierType === 6
                },
                bucketName
              )}
              data-hash={item.itemHash}
              data-instanceid={item.itemInstanceId}
              data-quantity={item.quantity && item.quantity > 1 ? item.quantity : null}
            >
              <div className='icon'>
                <ObservedImage className='image' src={definitionItem.displayProperties.localIcon ? `${definitionItem.displayProperties.icon}` : `https://www.bungie.net${definitionItem.displayProperties.icon}`} />
              </div>
              {tracked ? (
                <div className='track'>
                  <TrackingIcon />
                </div>
              ) : null}
              {item.quantity && item.quantity > 1 ? <div className={cx('quantity', { 'max-stack': definitionItem.inventory && definitionItem.inventory.maxStackSize === item.quantity })}>{item.quantity}</div> : null}
              {item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length === 0 ? <div className='completed' /> : null}
              {item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length > 0 && nowMs + 7200 * 1000 > expiryMs ? <div className='expires-soon' /> : null}
              {item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length > 0 ? (
                <ProgressBar
                  objectiveHash={item.itemComponents?.objectives[0].objectiveHash}
                  progress={item.itemComponents?.objectives.reduce((acc, curr) => {
                    return acc + curr.progress;
                  }, 0)}
                  completionValue={item.itemComponents?.objectives.reduce((acc, curr) => {
                    return acc + curr.completionValue;
                  }, 0)}
                  hideCheck
                />
              ) : null}
              {isQuest ? <ProfileLink to={`/quests/${item.itemHash}`} /> : null}
            </li>
          )
        };
      })
      .filter(i => i);
  };

  render() {
    const { t, member, auth, viewport } = this.props;
    const order = this.props.match.params.order || 'rarity';
    const hash = this.props.match.params.hash;

    if (!member.data.profile.profileInventory?.data && !auth) {
      return <NoAuth />;
    }

    if (!member.data.profile.profileInventory?.data && auth && !auth.destinyMemberships.find(m => m.membershipId === member.membershipId)) {
      return <DiffProfile />;
    }

    if (!member.data.profile.profileInventory?.data && auth && auth.destinyMemberships.find(m => m.membershipId === member.membershipId)) {
      return (
        <div className='view' id='quests'>
          <Spinner />
        </div>
      );
    }

    const inventory = member.data.profile.profileInventory.data.items
      .slice()
      .concat(member.data.profile.characterInventories.data[member.characterId].items)
      .map(i => ({ ...manifest.DestinyInventoryItemDefinition[i.itemHash], ...i }));

    const filteredInventory = inventory
      .filter(i => i.bucketHash === 1345459588)
      .concat(
        // Include prophecy tablets, which are in consumables
        inventory.filter(i => i.bucketHash === 1469714392).filter(i => i.itemCategoryHashes.includes(2250046497))
      );

    const constructed = groupBy(filteredInventory, item => {
      if (item.itemCategoryHashes.includes(16) || item.itemCategoryHashes.includes(2250046497) || (item.objectives && item.objectives.questlineItemHash)) {
        return 'quests';
      }
      if (!item.objectives || item.objectives.length === 0 || item.sockets) {
        return 'items';
      }

      return 'bounties';
    });

    const quests = orderBy(this.process(constructed.quests, true), [i => i[order], i => i.name], ['desc', 'asc']);
    const questsItems = orderBy(this.process(constructed.items), [i => i[order], i => i.name], ['desc', 'asc']);
    const bounties = orderBy(this.process(constructed.bounties), [i => i.expiryMs, i => i[order], i => i.name], ['asc', 'desc', 'asc']);

    const selected = hash ? (quests.find(p => p.itemHash.toString() === hash) ? quests.find(p => p.itemHash.toString() === hash) : quests[0]) : quests.length && quests[0] && quests[0].itemHash ? quests[0] : false;

    return (
      <>
        {viewport.width < 1024 && hash ? (
          <div className='view quest' id='quests'>
            <div className='module'>
              <QuestLine item={selected} />
            </div>
          </div>
        ) : (
          <div className='view bounties' id='quests'>
            <div className='module'>
              <div className='sub-header'>
                <div>{t('Bounties')}</div>
                {filteredInventory.length > 30 ? <div>{filteredInventory.length}/63</div> : null}
              </div>
              {bounties.length ? (
                <ul className='list inventory-items'>{bounties.map(i => i.el)}</ul>
              ) : (
                <div className='info'>
                  <p>{t("No bounties. Go and see if there's anything you can do for Failsafe. If nothing else, keep her company...")}</p>
                </div>
              )}
            </div>
            <div className='module'>
              <div className='sub-header'>
                <div>{t('Quests')}</div>
                {filteredInventory.length > 30 ? <div>{filteredInventory.length}/63</div> : null}
              </div>
              {quests.length ? (
                <ul className='list inventory-items'>{quests.concat(questsItems).map(i => i.el)}</ul>
              ) : (
                <div className='info'>
                  <p>{t('No quests. Speak to Zavala, maybe?')}</p>
                </div>
              )}
            </div>
            <div className='module'>{selected && viewport.width >= 1024 ? <QuestLine item={selected} /> : null}</div>
          </div>
        )}
        <div className='sticky-nav'>
          <div className='wrapper'>
            <div />
            <ul>
              {viewport.width < 1024 && hash ? (
                <li>
                  <ProfileLink className='button' to='/quests'>
                    <DestinyKey type='dismiss' />
                    {t('Back')}
                  </ProfileLink>
                </li>
              ) : (
                <li>
                  <ProfileLink className='button' to='/quests/bounty-tracker'>
                    <DestinyKey type='more' />
                    {t('Bounty Tracker')}
                  </ProfileLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    auth: state.auth,
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

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(Quests);
