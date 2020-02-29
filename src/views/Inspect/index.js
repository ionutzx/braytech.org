import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter, Link } from 'react-router-dom';
import cx from 'classnames';
import queryString from 'query-string';

import manifest from '../../utils/manifest';
import * as enums from '../../utils/destinyEnums';
import * as utils from '../../utils/destinyUtils';
import ObservedImage from '../../components/ObservedImage';
import { DestinyKey } from '../../components/UI/Button';
import { ReactComponent as Void } from '../../svg/miscellaneous/void.svg';
import { ReactComponent as Arc } from '../../svg/miscellaneous/arc.svg';
import { ReactComponent as Solar } from '../../svg/miscellaneous/solar.svg';

import { sockets } from '../../utils/destinyItems/sockets';
import { stats, statsMs } from '../../utils/destinyItems/stats';
import { masterwork } from '../../utils/destinyItems/masterwork';
import { getSocketsWithStyle, getModdedStatValue, getSumOfArmorStats } from '../../utils/destinyItems/utils';

import Scene from '../../components/Three/Inspect/Scene';

import './styles.css';


import './styles.css';

const damageTypeMap = {
  3454344768: {
    className: 'void',
    svg: Void
  },
  2303181850:{
    className: 'arc',
    svg: Arc
  },
  1847026933:{
    className: 'solar',
    svg: Solar
  }
};

class Inspect extends React.Component {
  state = {};

  componentDidMount() {
    window.scrollTo(0, 0);

    this.props.rebindTooltips();
  }

  handler_plugClick = (socketIndex, plugHash) => e => {
    // this.setState(p => ({
    //   sockets: {
    //     ...p.sockets,
    //     [socketIndex]: plugHash
    //   }
    // }));
    // console.log(socketIndex, plugHash)
  };

  render() {
    const { t, member, three, location } = this.props;
    const returnPath = location.state?.from || '/collections';
    const query = queryString.parse(location.search);

    const item = {
      itemHash: this.props.match.params.hash,
      itemInstanceId: false,
      itemComponents: false,
      showHiddenStats: true,
      showDefaultSockets: true
    };

    const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

    // process sockets
    item.sockets = sockets(item);

    // adjust sockets according to user selection
    if (item.sockets.sockets) {
      item.sockets.sockets = item.sockets.sockets.map((socket, s) => {
        const selectedPlugHash = Number(query.sockets?.split('/')[socket.socketIndex]);
  
        // if user has selected a plug
        if (selectedPlugHash > 0) {
          const selectedPlug = socket.plugOptions.find(o => selectedPlugHash === o.plugItem.hash);
  
          // reconfigure plugOptions for this socket, according to user-selected plugs
          socket.plugOptions = socket.plugOptions.map(o => {
            o.isActive = false;
  
            if (selectedPlug && selectedPlug.plugItem.hash === o.plugItem.hash) {
              o.isActive = true;
            }
  
            return o;
          });
  
          // set active plug as primary plug
          socket.plug = (selectedPlugHash && socket.plugOptions.find(o => selectedPlugHash === o.plugItem.hash)) || socket.plug;
  
          return socket;
        }
  
        return socket;
      });
    }

    // stats and masterwork as per usual
    item.stats = stats(item);
    item.masterwork = masterwork(item);

    item.primaryStat = (definitionItem.itemType === 2 || definitionItem.itemType === 3) && definitionItem.stats && !definitionItem.stats.disablePrimaryStatDisplay && definitionItem.stats.primaryBaseStatHash && {
      hash: definitionItem.stats.primaryBaseStatHash,
      displayProperties: manifest.DestinyStatDefinition[definitionItem.stats.primaryBaseStatHash].displayProperties,
      value: 950
    };

    if (item.primaryStat && item.itemComponents && item.itemComponents.instance?.primaryStat) {
      item.primaryStat.value = item.itemComponents.instance.primaryStat.value;
    } else if (item.primaryStat && member && member.data) {
      let character = member.data.profile.characters.data.find(characrer => characrer.characterId === member.characterId);

      item.primaryStat.value = Math.floor((942 / 973) * character.light);
    }

    console.log(item);

    // weapon damage type
    const damageTypeHash = definitionItem.itemType === enums.DestinyItemType.Weapon && (item.itemComponents?.instance ? item.itemComponents.instance.damageTypeHash : definitionItem.defaultDamageTypeHash);

    const DamageTypeSVG = damageTypeMap[damageTypeHash]?.svg;

    const preparedSockets = item.sockets?.socketCategories?.reduce((a, v) => {
      v.sockets.forEach(socket => {
        if (socket.plugOptions.filter(plug => plug.isOrnament).length) {
          socket.plugOptions.splice(0, 0, socket.plug);
        }
      });

      const modCategory = a.find(category => category.category.categoryStyle === 2);

      if (modCategory) {
        modCategory.sockets.push(...v.sockets);

        return a;
      } else {
        return [...a, v];
      }
    }, []);

    const displayStats = (item.stats && item.stats.length && !item.stats.find(stat => stat.statHash === -1000)) || (item.stats && item.stats.length && item.stats.find(stat => stat.statHash === -1000 && stat.value !== 0));
    const displaySockets = item.sockets && item.sockets.socketCategories && item.sockets.sockets.filter(socket => (socket.isPerk || socket.isIntrinsic || socket.isMod || socket.isOrnament) && !socket.isTracker && !socket.isShader && socket.plug?.plugItem).length;

    const armor2MasterworkSockets = item.sockets && item.sockets.socketCategories && getSocketsWithStyle(item.sockets, enums.DestinySocketCategoryStyle.EnergyMeter);

    return (
      <>
        <div className='view' id='inspect'>
          {three.enabled ? (
            <Scene itemHash={definitionItem.hash} ornamentHash={this.state.ornamentHash} {...three} />
          ) : definitionItem.screenshot && definitionItem.screenshot !== '' ? (
            <div className='screenshot'>
              <ObservedImage src={`https://www.bungie.net${definitionItem.screenshot}`} />
            </div>
          ) : null}
          {definitionItem.secondaryIcon && definitionItem.secondaryIcon !== '/img/misc/missing_icon_d2.png' && definitionItem.secondaryIcon !== '' ? (
            <div className='foundry'>
              <ObservedImage src={`https://www.bungie.net${definitionItem.secondaryIcon}`} />
            </div>
          ) : null}
          <div className={cx('item-rarity', utils.itemRarityToString(definitionItem.inventory.tierType))} />
          <div className='wrap'>
            <div className='row header'>
              <div className='icon'>{definitionItem.displayProperties.icon ? <ObservedImage src={`https://www.bungie.net${definitionItem.displayProperties.icon}`} /> : null}</div>
              <div className='text'>
                <div className='name'>{definitionItem.displayProperties.name}</div>
                <div className='type'>{definitionItem.itemTypeDisplayName}</div>
              </div>
              <div className='flair'>{definitionItem.displayProperties.description}</div>
            </div>
            {displayStats ? (
              <div className='row values'>
                {item.primaryStat ? <div className='primary'>
                  <div className='stat'>
                    {damageTypeMap[damageTypeHash] ? <div className={cx('icon', utils.damageTypeToAsset(damageTypeHash)?.string)}>
                      <DamageTypeSVG />
                    </div> : null}
                    <div className='text'>{item.primaryStat.value}</div>
                  </div>
                </div> : null}
                <div className='stats'>
                  {item.stats.map(stat => {
                    // map through stats

                    const armor2MasterworkValue = armor2MasterworkSockets && getSumOfArmorStats(armor2MasterworkSockets, [stat.statHash]);

                    const moddedValue = item.sockets && item.sockets.sockets && getModdedStatValue(item.sockets, stat);
                    const masterworkValue = (item.masterwork && item.masterwork.stats?.find(m => m.hash === stat.statHash) && item.masterwork.stats?.find(m => m.hash === stat.statHash).value) || armor2MasterworkValue || 0;

                    let baseBar = stat.value;

                    if (moddedValue) {
                      baseBar -= moddedValue;
                    }

                    if (masterworkValue) {
                      baseBar -= masterworkValue;
                    }

                    const segments = [[baseBar]];

                    if (moddedValue) {
                      segments.push([moddedValue, 'modded']);
                    }

                    if (masterworkValue) {
                      segments.push([masterworkValue, 'masterwork']);
                    }

                    return (
                      <div key={stat.statHash} className='stat'>
                        <div className='name'>{stat.statHash === -1000 ? t('Total') : stat.displayProperties.name}</div>
                        <div className={cx('value', { bar: stat.bar })}>
                          {stat.bar ? (
                            <>
                              {segments.map(([value, className], i) => (
                                <div key={i} className={cx('bar', className)} data-value={value} style={{ width: `${Math.min(100, Math.floor(100 * (value / stat.maximumValue)))}%` }} />
                              ))}
                              <div className='int'>{stat.value}</div>
                            </>
                          ) : (
                            <div className={cx('text', { masterwork: masterworkValue !== 0 })}>
                              {stat.value} {statsMs.includes(stat.statHash) && 'ms'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {displaySockets ? (
              <div className='sockets'>
                {preparedSockets.map((category, c) => {
                  return (
                    <div className={cx('row', 'category', { mods: category.category.categoryStyle === 2 })} key={c}>
                      <div className='category-name'>{category.category.displayProperties.name}</div>
                      <div className='category-sockets'>
                        {category.sockets
                          .filter(socket => !socket.isTracker)
                          .map((socket, s) => {
                            const expanded = false; // TODO lol

                            // if mods and socket expanded by user OR if mods and a single plug option OR if not mods i.e. perks lol
                            // ^ ????

                            // armor perks and armor tier (and shader?)
                            if ((category.category.categoryStyle === 2 && expanded) || (category.category.categoryStyle === 2 && socket.plugOptions.length < 2) || category.category.categoryStyle !== 2) {
                              return (
                                <div className={cx('socket', { intrinsic: socket.isIntrinsic, columned: category.category.categoryStyle !== 2 && socket.plugOptions.length > 9 })} key={s}>
                                  {socket.plugOptions.map((plug, p) => {
                                    const selectedSockets = query.sockets?.split('/');
                                    const socketsString = item.sockets.sockets.map(socket => (selectedSockets && Number(selectedSockets[socket.socketIndex])) || '');
  
                                    socketsString[socket.socketIndex] = plug.plugItem.hash;
  
                                    const socketLink = `/inspect/${item.itemHash}?sockets=${socketsString.join('/')}`;
  
                                    return (
                                      <div key={p} className={cx('plug', 'tooltip', { active: plug.isActive })} data-hash={plug.plugItem.hash} data-style='ui' onClick={this.handler_plugClick(socket.socketIndex, plug.plugItem.hash)}>
                                        <div className='icon'>
                                          <ObservedImage src={`https://www.bungie.net${plug.plugItem.displayProperties.icon}`} />
                                        </div>
                                        <Link to={socketLink} />
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            } else {
                              return (
                                <div className={cx('socket', { intrinsic: socket.isIntrinsic, columned: category.category.categoryStyle !== 2 && socket.plugOptions.length > 9 })} key={s}>
                                  {socket.plugOptions.filter(o => o.plugItem?.hash === socket.plug.plugItem?.hash).map((plug, p) => {
                                    const selectedSockets = query.sockets?.split('/');
                                    const socketsString = item.sockets.sockets.map(socket => (selectedSockets && Number(selectedSockets[socket.socketIndex])) || '');
  
                                    socketsString[socket.socketIndex] = plug.plugItem.hash;
  
                                    const socketLink = `/inspect/${item.itemHash}?sockets=${socketsString.join('/')}`;
  
                                    return (
                                      <div key={p} className={cx('plug', 'tooltip', { active: plug.isActive })} data-hash={plug.plugItem.hash} data-style='ui' onClick={this.handler_plugClick(socket.socketIndex, plug.plugItem.hash)}>
                                        <div className='icon'>
                                          <ObservedImage src={`https://www.bungie.net${plug.plugItem.displayProperties.icon}`} />
                                        </div>
                                        <Link to={socketLink} />
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }
                            
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        <div className='sticky-nav'>
          <div className='wrapper'>
            <div />
            <ul>
              <li>
                <Link className='button' to={returnPath}>
                  <DestinyKey type='dismiss' />
                  {t('Dismiss')}
                </Link>
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
    three: state.three
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation(), withRouter)(Inspect);
