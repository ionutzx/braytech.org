import React from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as utils from '../../../utils/destinyUtils';
import * as enums from '../../../utils/destinyEnums';
import ObservedImage from '../../ObservedImage';

// import ReportPlayer from '../ReportPlayer';

const medalExclusions = ['allMedalsEarned', 'precisionKills', 'weaponKillsAbility', 'weaponKillsGrenade', 'weaponKillsMelee', 'weaponKillsSuper', 'primevalHealing', 'primevalDamage', 'primevalKills', 'motesPickedUp', 'motesLost', 'motesDeposited', 'motesDenied', 'bankOverage', 'supremacyAllyKillEnemyTagsCaptured', 'supremacyAllyTagsRecovered', 'supremacyCrestsRecovered', 'supremacyCrestsSecured', 'supremacyOwnKillEnemyTagsCaptured', 'supremacyOwnTagsRecovered'];

function formatValue(column, entry, playerCache = []) {
  if (column.custom) {
    if (column.key === 'supremacySecureRate') {
      return Number.parseFloat((entry.extended.values.supremacyOwnKillEnemyTagsCaptured.basic.value / entry.values.kills.basic.value) * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    } else {
      return '?';
    }
  } else if (column.extended) {
    // from the extended stats value
    if (column.round) {
      return Number.parseFloat(entry.extended.values[column.key].basic[column.type]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return entry.extended.values[column.key].basic[column.type].toLocaleString();
    }    
  } else if (column.async) {
    // async profile data
    const cache = playerCache.find(p => p.membershipId === entry.player.destinyUserInfo.membershipId);
    return cache && cache[column.key] ? cache[column.key] : '–';
  } else if (column.root) {
    // entry object root
    if (column.round) {
      return Number.parseFloat(entry[column.key].basic[column.type]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return entry[column.key].basic[column.type].toLocaleString();
    }
  } else {
    if (column.round) {
      return Number.parseFloat(entry.values[column.key].basic[column.type]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return entry.values[column.key].basic[column.type].toLocaleString();
    }
  }
}

export function EntryHeader(props) {
  const { playerCache, activityDetails, entry, team } = props;
  const { t, i18n } = useTranslation();

  const headers = {
    default: [
      {
        key: 'opponentsDefeated',
        name: t('Kills + assists'),
        abbr: 'KA',
        type: 'value'
      },
      {
        key: 'kills',
        name: t('Kills'),
        abbr: 'K',
        type: 'value'
      },
      {
        key: 'deaths',
        name: t('Deaths'),
        abbr: 'D',
        type: 'value'
      },
      {
        key: 'killsDeathsRatio',
        name: t('K/D'),
        abbr: 'KD',
        type: 'value',
        round: true
      }
    ],
    crucible: [
      {
        key: 'opponentsDefeated',
        name: t('Kills + assists'),
        abbr: 'KA',
        type: 'value'
      },
      {
        key: 'kills',
        name: t('Kills'),
        abbr: 'K',
        type: 'value'
      },
      {
        key: 'deaths',
        name: t('Deaths'),
        abbr: 'D',
        type: 'value'
      },
      {
        key: 'killsDeathsRatio',
        name: t('K/D'),
        abbr: 'KD',
        type: 'value',
        round: true
      },
      {
        key: 'gloryPoints',
        name: t('Glory points'),
        abbr: 'G',
        type: 'value',
        async: true,
        hideInline: true
      }
    ],
    strikes: [
      {
        key: 'opponentsDefeated',
        name: t('Kills + assists'),
        abbr: 'KA',
        type: 'value'
      },
      {
        key: 'kills',
        name: t('Kills'),
        abbr: 'K',
        type: 'value'
      },
      {
        key: 'deaths',
        name: t('Deaths'),
        abbr: 'D',
        type: 'value'
      },
      {
        key: 'killsDeathsRatio',
        name: t('K/D'),
        abbr: 'KD',
        type: 'value',
        round: true
      },
      {
        key: 'score',
        name: manifest.DestinyHistoricalStatsDefinition['score']?.statName,
        abbr: 'S',
        type: 'value',
        hideInline: true
      }
    ],
    gambit: [
      {
        key: 'opponentsDefeated',
        name: t('Kills + assists'),
        abbr: 'KA',
        type: 'value'
      },
      {
        key: 'motesDeposited',
        name: t('Motes deposited'),
        abbr: 'MD',
        type: 'value',
        extended: true
      },
      {
        key: 'motesLost',
        name: t('Motes lost'),
        abbr: 'ML',
        type: 'value',
        extended: true
      },
      {
        key: 'invasionKills',
        name: t('Invasion kills'),
        abbr: 'IK',
        type: 'value',
        extended: true
      },
      {
        key: 'blockerKills',
        name: t('Blocker kills'),
        type: 'value',
        extended: true,
        hideInline: true
      }
    ]
  };

  const variety = (enums.simplifiedAcivityModes.find(m => m.modes.indexOf(activityDetails.mode) > -1)?.name && headers[enums.simplifiedAcivityModes.find(m => m.modes.indexOf(activityDetails.mode) > -1)?.name] && enums.simplifiedAcivityModes.find(m => m.modes.indexOf(activityDetails.mode) > -1)?.name) || 'default';

  if (team) {
    return headers[variety].map((column, i) => (
      <div key={i} className={cx(column.key, { hideInline: column.hideInline })}>
        <div className='full'>{column.name}</div>
        <div className='abbr'>{column.abbr}</div>
      </div>
    ));
  } else {
    return headers[variety].map((column, i) => (
      <div key={i} className={cx(column.key, { hideInline: column.hideInline, extended: column.extended })}>
        {column.expanded ? <div className='name'>{column.name}</div> : null}
        <div className='value'>{formatValue(column, entry, playerCache)}</div>
      </div>
    ));
  }
}

export function EntryDetail(props) {
  const mode = props.activityDetails.mode;

  const variety = enums.simplifiedAcivityModes.find(m => m.modes.indexOf(mode) > -1)?.name;

  const rows = {
    crucible: CrucibleDetail,
    gambit: GambitDetail
  };

  if (!variety || !rows[variety]) return <DefaultDetail {...props} />;

  const DetailTemplate = rows[variety];

  return <DetailTemplate {...props} />;
}

export function DefaultDetail(props) {
  const { playerCache, activityDetails, entry } = props;
  const { t, i18n } = useTranslation();

  const [killsMelee, killsGrenade, killsSuper] = [
    { key: 'weaponKillsMelee', type: 'value', extended: true },
    { key: 'weaponKillsGrenade', type: 'value', extended: true },
    { key: 'weaponKillsSuper', type: 'value', extended: true }
  ].map(column => formatValue(column, entry));

  if (!entry.extended?.weapons?.length && killsMelee === '0' && killsGrenade === '0' && killsSuper === '0') {
    return (
      <div className='detail single'>
        <div className='group'>
          <div className='info'>{t('No stats were recorded')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='detail single'>
      <div className='group kills'>
        <ul>
          <li className='header'>
            <ul>
              <li>
                <div className='full'>{t('Weapon')}</div>
                <div className='abbr'>{t('Weapon')}</div>
              </li>
              <li>
                <div className='full'>{t('Kills')}</div>
                <div className='abbr'>K</div>
              </li>
              <li>
                <div className='full'>{t('Precision')}</div>
                <div className='abbr'>P</div>
              </li>
              <li>
                <div className='full'>{t('Accuracy')}</div>
                <div className='abbr'>A</div>
              </li>
            </ul>
          </li>
          {entry.extended?.weapons?.length
            ? entry.extended.weapons.map((weapon, w) => {
                const definitionItem = manifest.DestinyInventoryItemDefinition[weapon.referenceId];

                return (
                  <li key={w}>
                    <ul>
                      <li className='double'>
                        <ul className='list inventory-items'>
                          <li className={cx('item', 'tooltip')} data-hash={definitionItem.hash} data-uninstanced='yes'>
                            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${definitionItem.displayProperties.icon}`} />
                          </li>
                        </ul>
                        <div>{definitionItem.displayProperties.name}</div>
                      </li>
                      <li>{weapon.values?.uniqueWeaponKills?.basic?.value.toLocaleString() || '0'}</li>
                      <li>{weapon.values?.uniqueWeaponPrecisionKills?.basic?.value.toLocaleString() || '0'}</li>
                      <li>{(weapon.values?.uniqueWeaponKillsPrecisionKills?.basic?.value * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%' || '0%'}</li>
                    </ul>
                  </li>
                );
              })
            : null}
          {entry.extended?.weapons?.length ? <li className='divider' /> : null}
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Melee kills')}</div>
              </li>
              <li>{killsMelee}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Grenade kills')}</div>
              </li>
              <li>{killsGrenade}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Super kills')}</div>
              </li>
              <li>{killsSuper}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}

function hasActivitySpecific(modes) {
  if (modes.indexOf(31) > -1) {
    return 'supremacy';
  } else {
    return false;
  }
}

export function CrucibleDetail(props) {
  const { playerCache, activityDetails, entry } = props;
  const { t, i18n } = useTranslation();

  const cache = playerCache.find(p => p.membershipId === entry.player.destinyUserInfo.membershipId);

  const medals = Object.keys(entry.extended.values)
    .filter(key => !medalExclusions.includes(key))
    .sort((a, b) => (entry.extended.values[b].basic?.value || 0) - (entry.extended.values[a].basic?.value || 0));

  const activity = hasActivitySpecific(activityDetails.modes);

  const activitySpecific = {
    supremacy: [
      {
        key: 'supremacyCrestsSecured',
        name: t('Crests secured'),
        type: 'value',
        extended: true
      },
      {
        key: 'supremacyCrestsRecovered',
        name: t('Crests recovered'),
        type: 'value',
        extended: true
      },
      // {
      //   key: 'supremacySecureRate',
      //   name: t('Secure rate'),
      //   custom: true
      // },
      {
        divider: true
      },
      {
        key: 'supremacyOwnKillEnemyTagsCaptured',
        name: t('Kills secured'),
        type: 'value',
        extended: true
      },
      {
        key: 'supremacyAllyKillEnemyTagsCaptured',
        name: t('Allied kills secured'),
        type: 'value',
        extended: true
      },
      {
        divider: true
      },
      {
        key: 'supremacyOwnTagsRecovered',
        name: t('Crests recovered'),
        type: 'value',
        extended: true
      },
      {
        key: 'supremacyAllyTagsRecovered',
        name: t('Ally crests recovered'),
        type: 'value',
        extended: true
      }
    ]
  };

  return (
    <div className={cx('detail', 'crucible', { 'activity-specific': activity })}>
      <div className='group common'>
        <ul className='pairs'>
          <li className='header'>
            <ul>
              <li>{t('Player')}</li>
            </ul>
          </li>
          <li>
            <ul>
              <li>{t('Character class')}</li>
              <li>{utils.classHashToString(entry.player.classHash, entry.player.genderHash)}</li>
            </ul>
          </li>
          <li>
            <ul>
              <li>{t('Glory points')}</li>
              <li className={cx({ na: !cache?.['gloryPoints'] })}>{cache?.['gloryPoints'] || '–'}</li>
            </ul>
          </li>
          <li>
            <ul>
              <li>{t('Valor resets')}</li>
              <li className={cx({ na: !cache?.['valorResets'] })}>{cache?.['valorResets'] || '–'}</li>
            </ul>
          </li>
        </ul>
        {/* <ReportPlayer characterId={entry.characterId} /> */}
      </div>
      {activity ? (
        <div className='group activity'>
          <ul className='pairs'>
            <li className='header'>
              <ul>
                <li>{t('Activity')}</li>
              </ul>
            </li>
            {activitySpecific[activity].map((column, c) =>
              column.divider ? (
                <li key={c} className='divider' />
              ) : (
                <li key={c}>
                  <ul>
                    <li>{column.name}</li>
                    <li>{formatValue(column, entry)}</li>
                  </ul>
                </li>
              )
            )}
          </ul>
        </div>
      ) : null}
      <div className='group kills'>
        <ul>
          <li className='header'>
            <ul>
              <li>
                <div className='full'>{t('Weapon')}</div>
                <div className='abbr'>{t('Weapon')}</div>
              </li>
              <li>
                <div className='full'>{t('Kills')}</div>
                <div className='abbr'>K</div>
              </li>
              <li>
                <div className='full'>{t('Precision')}</div>
                <div className='abbr'>P</div>
              </li>
              <li>
                <div className='full'>{t('Accuracy')}</div>
                <div className='abbr'>A</div>
              </li>
            </ul>
          </li>
          {entry.extended?.weapons?.length
            ? entry.extended.weapons.map((weapon, w) => {
                const definitionItem = manifest.DestinyInventoryItemDefinition[weapon.referenceId];

                return (
                  <li key={w}>
                    <ul>
                      <li className='double'>
                        <ul className='list inventory-items'>
                          <li className={cx('item', 'tooltip')} data-hash={definitionItem.hash} data-uninstanced='yes'>
                            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${definitionItem.displayProperties.icon}`} />
                          </li>
                        </ul>
                        <div>{definitionItem.displayProperties.name}</div>
                      </li>
                      <li>{weapon.values?.uniqueWeaponKills?.basic?.value.toLocaleString() || '0'}</li>
                      <li>{weapon.values?.uniqueWeaponPrecisionKills?.basic?.value.toLocaleString() || '0'}</li>
                      <li>{(weapon.values?.uniqueWeaponKillsPrecisionKills?.basic?.value * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%' || '0%'}</li>
                    </ul>
                  </li>
                );
              })
            : null}
          {entry.extended?.weapons?.length ? <li className='divider' /> : null}
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Melee kills')}</div>
              </li>
              <li>{formatValue({ key: 'weaponKillsMelee', type: 'value', extended: true }, entry)}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Grenade kills')}</div>
              </li>
              <li>{formatValue({ key: 'weaponKillsGrenade', type: 'value', extended: true }, entry)}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Super kills')}</div>
              </li>
              <li>{formatValue({ key: 'weaponKillsSuper', type: 'value', extended: true }, entry)}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
        </ul>
      </div>
      <div className='group medals'>
        <ul>
          <li className='header'>
            <ul>
              <li>{t('Medals')}</li>
            </ul>
          </li>
          {medals.map((key, k) => {
            const medal = entry.extended.values[key];
            const definitionMedal = manifest.DestinyHistoricalStatsDefinition[key];

            const count = medal.basic?.value || '0';
            const icon = definitionMedal && definitionMedal.iconImage && definitionMedal.iconImage !== '' ? definitionMedal.iconImage : manifest.settings.destiny2CoreSettings.undiscoveredCollectibleImage;

            return (
              <li key={k}>
                <ul>
                  <li className='double'>
                    <ul className='list inventory-items'>
                      <li key={k} className='item tooltip' data-hash={key} data-type='stat'>
                        <ObservedImage className={cx('image', 'icon')} src={`${!definitionMedal.localIcon ? 'https://www.bungie.net' : ''}${icon}`} />
                      </li>
                    </ul>
                    <div>{definitionMedal.statName || t('Unknown')}</div>
                  </li>
                  <li>{count}</li>
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function GambitDetail(props) {
  const { playerCache, activityDetails, entry } = props;
  const { t, i18n } = useTranslation();

  const cache = playerCache.find(p => p.membershipId === entry.player.destinyUserInfo.membershipId);

  const medals = Object.keys(entry.extended.values)
    .filter(key => !medalExclusions.includes(key))
    .filter(key => key.indexOf('medal') > -1);

  const activitySpecific = [
    // Motes
    {
      key: 'motesDeposited',
      name: t('Motes deposited'),
      type: 'value',
      extended: true
    },
    {
      key: 'motesLost',
      name: t('Motes lost'),
      type: 'value',
      extended: true
    },
    {
      key: 'motesDenied',
      name: t('Motes denied'),
      type: 'value',
      extended: true
    },
    {
      divider: true
    },
    // PVP
    {
      key: 'invasions',
      name: t('Invasions'),
      type: 'value',
      extended: true
    },
    {
      key: 'invasionKills',
      name: t('Invasion kills'),
      type: 'value',
      extended: true
    },
    {
      key: 'invasionDeaths',
      name: t('Invasion deaths'),
      type: 'value',
      extended: true
    },
    {
      key: 'invaderKills',
      name: t('Invader kills'),
      type: 'value',
      extended: true
    },
    {
      key: 'invaderDeaths',
      name: t('Invader deaths'),
      type: 'value',
      extended: true
    },
    {
      divider: true
    },
    // Mobs
    {
      key: 'mobKills',
      name: t('Mob kills'),
      type: 'value',
      extended: true
    },
    {
      key: 'highValueKills',
      name: t('High value targets'),
      type: 'value',
      extended: true
    },
    {
      key: 'blockerKills',
      name: t('Blocker kills'),
      type: 'value',
      extended: true
    },
    {
      key: 'smallBlockersSent',
      name: t('Small blockers sent'),
      type: 'value',
      extended: true
    },
    {
      key: 'mediumBlockersSent',
      name: t('Medium blockers sent'),
      type: 'value',
      extended: true
    },
    {
      key: 'largeBlockersSent',
      name: t('Large blockers sent'),
      type: 'value',
      extended: true
    },
    {
      divider: true
    },
    {
      key: 'primevalDamage',
      name: t('Primeval damage'),
      type: 'value',
      extended: true
    },
    {
      key: 'primevalHealing',
      name: t('Primeval healing'),
      type: 'displayValue',
      extended: true
    }
  ];

  return (
    <div className='detail gambit activity-specific'>
      <div className='group common'>
        <ul className='pairs'>
          <li className='header'>
            <ul>
              <li>{t('Player')}</li>
            </ul>
          </li>
          <li>
            <ul>
              <li>{t('Character class')}</li>
              <li>{utils.classHashToString(entry.player.classHash, entry.player.genderHash)}</li>
            </ul>
          </li>
          <li>
            <ul>
              <li>{t('Infamy points')}</li>
              <li className={cx({ na: !cache?.['infamyPoints'] })}>{cache?.['infamyPoints'] || '–'}</li>
            </ul>
          </li>
          <li>
            <ul>
              <li>{t('Infamy resets')}</li>
              <li className={cx({ na: !cache?.['infamyResets'] })}>{cache?.['infamyResets'] || '–'}</li>
            </ul>
          </li>
        </ul>
      </div>
      <div className='group activity'>
        <ul className='pairs'>
          <li className='header'>
            <ul>
              <li>{t('Activity')}</li>
            </ul>
          </li>
          {activitySpecific.map((column, c) =>
            column.divider ? (
              <li key={c} className='divider' />
            ) : (
              <li key={c}>
                <ul>
                  <li>{column.name}</li>
                  <li>{formatValue(column, entry)}</li>
                </ul>
              </li>
            )
          )}
        </ul>
      </div>
      <div className='group kills'>
        <ul>
          <li className='header'>
            <ul>
              <li>
                <div className='full'>{t('Weapon')}</div>
                <div className='abbr'>{t('Weapon')}</div>
              </li>
              <li>
                <div className='full'>{t('Kills')}</div>
                <div className='abbr'>K</div>
              </li>
              <li>
                <div className='full'>{t('Precision')}</div>
                <div className='abbr'>P</div>
              </li>
              <li>
                <div className='full'>{t('Accuracy')}</div>
                <div className='abbr'>A</div>
              </li>
            </ul>
          </li>
          {entry.extended?.weapons?.length
            ? entry.extended.weapons.map((weapon, w) => {
                const definitionItem = manifest.DestinyInventoryItemDefinition[weapon.referenceId];

                return (
                  <li key={w}>
                    <ul>
                      <li className='double'>
                        <ul className='list inventory-items'>
                          <li className={cx('item', 'tooltip')} data-hash={definitionItem.hash} data-uninstanced='yes'>
                            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${definitionItem.displayProperties.icon}`} />
                          </li>
                        </ul>
                        <div>{definitionItem.displayProperties.name}</div>
                      </li>
                      <li>{weapon.values?.uniqueWeaponKills?.basic?.value.toLocaleString() || '0'}</li>
                      <li>{weapon.values?.uniqueWeaponPrecisionKills?.basic?.value.toLocaleString() || '0'}</li>
                      <li>{(weapon.values?.uniqueWeaponKillsPrecisionKills?.basic?.value * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%' || '0%'}</li>
                    </ul>
                  </li>
                );
              })
            : null}
          {entry.extended?.weapons?.length ? <li className='divider' /> : null}
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Melee kills')}</div>
              </li>
              <li>{formatValue({ key: 'weaponKillsMelee', type: 'value', extended: true }, entry)}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Grenade kills')}</div>
              </li>
              <li>{formatValue({ key: 'weaponKillsGrenade', type: 'value', extended: true }, entry)}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
          <li>
            <ul>
              <li className='double'>
                <div></div>
                <div>{t('Super kills')}</div>
              </li>
              <li>{formatValue({ key: 'weaponKillsSuper', type: 'value', extended: true }, entry)}</li>
              <li className='na'>–</li>
              <li className='na'>–</li>
            </ul>
          </li>
        </ul>
      </div>
      <div className='group medals'>
        <ul>
          <li className='header'>
            <ul>
              <li>{t('Medals')}</li>
            </ul>
          </li>
          {medals.length ? (
            medals
              .sort((a, b) => (entry.extended.values[b].basic?.value || 0) - (entry.extended.values[a].basic?.value || 0))
              .map((key, k) => {
                const medal = entry.extended.values[key];
                const definitionMedal = manifest.DestinyHistoricalStatsDefinition[key];

                const count = medal.basic?.value || '0';
                const icon = definitionMedal && definitionMedal.iconImage && definitionMedal.iconImage !== '' ? definitionMedal.iconImage : manifest.settings.destiny2CoreSettings.undiscoveredCollectibleImage;

                return (
                  <li key={k}>
                    <ul>
                      <li className='double'>
                        <ul className='list inventory-items'>
                          <li key={k} className='item tooltip' data-hash={key} data-type='stat'>
                            <ObservedImage className={cx('image', 'icon')} src={`${!definitionMedal.localIcon ? 'https://www.bungie.net' : ''}${icon}`} />
                          </li>
                        </ul>
                        <div>{definitionMedal.statName || t('Unknown')}</div>
                      </li>
                      <li>{count}</li>
                    </ul>
                  </li>
                );
              })
          ) : (
            <li>
              <div className='info'>{t('No medals awarded')}</div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
