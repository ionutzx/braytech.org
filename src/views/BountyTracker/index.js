import React from 'react';
import { connect } from 'react-redux';
import { orderBy, groupBy } from 'lodash';
import cx from 'classnames';

import { t, duration, timestampToDuration } from '../../utils/i18n';
import manifest from '../../utils/manifest';
import * as enums from '../../utils/destinyEnums';
import { itemComponents } from '../../utils/destinyItems/itemComponents';
import ObservedImage from '../../components/ObservedImage';
import { NoAuth, DiffProfile } from '../../components/BungieAuth';
import { ProfileLink } from '../../components/ProfileLink';
import Spinner from '../../components/UI/Spinner';
import ProgressBar from '../../components/UI/ProgressBar';
import { DestinyKey } from '../../components/UI/Button';
import Items from '../../components/Items';

import './styles.css';

const stackUniqueLabelLookup = itemHash => {
  const definitionItem = manifest.DestinyInventoryItemDefinition[itemHash];

  if (!definitionItem.inventory?.stackUniqueLabel) return null;

  const map = {
    crucible: 3603221665, // Lord Shaxx
    strikes: 69482069, // Commander Zavala
    gambit: 248695599, // The Drifter
    gunsmith: 672118013, // Banshee-44
    'luna.public_loop': 1616085565, // Eris Morn
    'luna.nightmare': 3411552308, // The Drifter
    dawning: 919809084 // Eva Levante
  };

  const find = Object.entries(map).find(([string, vendorHash]) => definitionItem.inventory.stackUniqueLabel.includes(string));

  return find?.[1];
};

class BountyTracker extends React.Component {
  state = {
    order: {
      sort: false,
      dir: 'desc'
    }
  };

  componentDidMount() {
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

        // bounty complete
        if (item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length === 0) {
          return false;
        }

        // no expiry
        if (!item.itemComponents.item?.expirationDate) {
          return false;
        }

        const expirationDate = item.itemComponents.item?.expirationDate;
        const timestamp = expirationDate && new Date().getTime();
        const timestampExpiry = expirationDate && new Date(expirationDate).getTime();

        const bucketName = definitionBucket?.displayProperties?.name?.replace(' ', '-').toLowerCase();
        const vendorHash = Number(Object.keys(manifest.DestinyVendorDefinition).find(key => manifest.DestinyVendorDefinition[key].itemList?.find(i => i.itemHash === item.itemHash)) || stackUniqueLabelLookup(item.itemHash) || 0);

        if (vendorHash === 0) {
          console.log(`Couldn't determine vendor hash: ${item.itemHash}`);
        }

        const masterworked = enums.enumerateItemState(item.state).masterworked;
        const tracked = enums.enumerateItemState(item.state).tracked;

        const objectives = [];
        definitionItem.objectives &&
          definitionItem.objectives.objectiveHashes.forEach(hash => {
            const definitionObjective = manifest.DestinyObjectiveDefinition[hash];

            const instanceProgressObjective = item.itemComponents?.objectives?.length && item.itemComponents.objectives.find(o => o.objectiveHash === hash);

            let playerProgress = {
              complete: false,
              progress: 0,
              objectiveHash: definitionObjective.hash
            };

            playerProgress = { ...playerProgress, ...instanceProgressObjective };

            objectives.push(<ProgressBar key={definitionObjective.hash} objectiveHash={definitionObjective.hash} {...playerProgress} />);
          });

        const objectivesProgress =
          (item.itemComponents?.objectives &&
            item.itemComponents?.objectives.filter(o => !o.complete).length > 0 &&
            item.itemComponents.objectives.reduce((acc, curr) => {
              return acc + curr.progress;
            }, 0)) ||
          0;
        const objectivesCompletionValue =
          (item.itemComponents?.objectives &&
            item.itemComponents?.objectives.filter(o => !o.complete).length > 0 &&
            item.itemComponents.objectives.reduce((acc, curr) => {
              return acc + curr.completionValue;
            }, 0)) ||
          0;

        return {
          ...item,
          sorts: {
            name: definitionItem.displayProperties?.name,
            rarity: definitionItem.inventory?.tierType,
            vendorHash,
            objectives: objectivesProgress / objectivesCompletionValue,
            timestampExpiry: timestampExpiry || 10000 * 10000 * 10000 * 10000
          },
          el: (
            <li key={item.itemHash}>
              <ul>
                <li className='col bounty-item'>
                  <ul className='list inventory-items'>
                    <li
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
                      {item.quantity && item.quantity > 1 ? <div className={cx('quantity', { 'max-stack': definitionItem.inventory?.maxStackSize === item.quantity })}>{item.quantity}</div> : null}
                      {item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length === 0 ? <div className='completed' /> : null}
                      {item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length > 0 && nowMs + 7200 * 1000 > timestampExpiry ? <div className='expires-soon' /> : null}
                      {item.itemComponents?.objectives && item.itemComponents?.objectives.filter(o => !o.complete).length > 0 ? <ProgressBar objectiveHash={item.itemComponents.objectives[0].objectiveHash} progress={objectivesProgress} completionValue={objectivesCompletionValue} hideCheck /> : null}
                    </li>
                  </ul>
                </li>
                <li className='col bounty-text'>
                  <div className='name'>{definitionItem.displayProperties?.name}</div>
                  <div className='description'>
                    <pre>{definitionItem.displayProperties?.description}</pre>
                  </div>
                </li>
                <li className='col objectives'>{objectives}</li>
                <li className='col reward-items'>
                  <ul className='list inventory-items'>
                    <Items items={definitionItem.value?.itemValue?.filter(i => i.itemHash !== 0)} noBorder hideQuantity />
                  </ul>
                </li>
                <li className='col expires'>
                  <div>
                    {item.itemComponents?.objectives?.length && item.itemComponents.objectives.filter(o => !o.complete).length > 0 && expirationDate ? (
                      timestampExpiry > timestamp ? (
                        <>
                          {t('Expires in {{duration}}.', { duration: duration(timestampToDuration(expirationDate), { relative: true }) })}
                        </>
                      ) : (
                        <>{t('Expired.')}</>
                      )
                    ) : null}
                  </div>
                </li>
              </ul>
            </li>
          )
        };
      })
      .filter(i => i);
  };

  handler_changeSortTo = to => e => {
    this.setState(p => ({
      ...p,
      order: {
        ...p.order,
        dir: p.order.sort === to && p.order.dir === 'desc' ? 'asc' : 'desc',
        sort: to
      }
    }));
  };

  render() {
    const { member, auth, viewport } = this.props;

    if (viewport.width < 940) {
      return (
        <>
          <div className='view error viewport-width' id='bounty-tracker'>
            <div className='properties'>
              <div className='name'>{t('Bounty Tracker')}</div>
              <div className='description'>
                <p>{t('Bounty Tracker is intended for use on larger displays. Please use a display with a viewport of atleast 960px.')}</p>
              </div>
            </div>
          </div>
          <div className='sticky-nav'>
            <div className='wrapper'>
              <div />
              <ul>
                <li>
                  <ProfileLink className='button' to='/quests'>
                    <DestinyKey type='dismiss' />
                    {t('Back')}
                  </ProfileLink>
                </li>
              </ul>
            </div>
          </div>
        </>
      );
    }

    if (!member.data.profile.profileInventory?.data && !auth) {
      return <NoAuth />;
    }

    if (!member.data.profile.profileInventory?.data && auth && !auth.destinyMemberships.find(m => m.membershipId === member.membershipId)) {
      return <DiffProfile />;
    }

    if (!member.data.profile.profileInventory?.data && auth && auth.destinyMemberships.find(m => m.membershipId === member.membershipId)) {
      return (
        <div className='view' id='bounty-tracker'>
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

    const bounties = [
      {
        el: (
          <li key='header-row' className='header'>
            <ul>
              <li className={cx('col', 'bounty-item', 'no-sort')} />
              <li className={cx('col', 'bounty-text', { sort: !this.state.order.sort, asc: this.state.order.dir === 'asc' })} onClick={this.handler_changeSortTo(false)}>
                <div className='full'>{t('Bounty')}</div>
              </li>
              <li className={cx('col', 'objectives', { sort: this.state.order.sort === 'objectives', asc: this.state.order.dir === 'asc' })} onClick={this.handler_changeSortTo('objectives')}>
                <div className='full'>{t('Objectives')}</div>
              </li>
              <li className={cx('col', 'reward-items', 'no-sort')}>
                <div className='full'>{t('Rewards')}</div>
              </li>
              <li className={cx('col', 'expires', { sort: this.state.order.sort === 'timestampExpiry', asc: this.state.order.dir === 'asc' })} onClick={this.handler_changeSortTo('timestampExpiry')}>
                <div className='full'>{t('Expiry')}</div>
              </li>
            </ul>
          </li>
        )
      },
      ...orderBy(this.process(constructed.bounties), [i => i.sorts[this.state.order.sort || 'vendorHash'], i => (this.state.order.sort !== 'timestampExpiry' ? i.sorts.timestampExpiry : 0), i => i.sorts.rarity, i => i.sorts.name], [this.state.order.dir, 'asc', 'asc', 'desc', 'asc'])
    ];

    if (bounties.length < 2) {
      return (
        <>
          <div className='view error' id='bounty-tracker'>
            <div className='properties'>
              <div className='name'>{t('Bounty Tracker')}</div>
              <div className='description'>
                <p>{t("You've got no bounties to track, boss!")}</p>
              </div>
            </div>
          </div>
          <div className='sticky-nav'>
            <div className='wrapper'>
              <div />
              <ul>
                <li>
                  <ProfileLink className='button' to='/quests'>
                    <DestinyKey type='dismiss' />
                    {t('Back')}
                  </ProfileLink>
                </li>
              </ul>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className='view' id='bounty-tracker'>
          {bounties.length ? (
            <ul className='list bounties'>{bounties.map(i => i.el)}</ul>
          ) : (
            <div className='info'>
              <p>{t("No bounties. Go and see if there's anything you can do for Failsafe. If nothing else, keep her company...")}</p>
            </div>
          )}
        </div>
        <div className='sticky-nav'>
          <div className='wrapper'>
            <div />
            <ul>
              <li>
                <ProfileLink className='button' to='/quests'>
                  <DestinyKey type='dismiss' />
                  {t('Back')}
                </ProfileLink>
              </li>
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

export default connect(mapStateToProps, mapDispatchToProps)(BountyTracker);
