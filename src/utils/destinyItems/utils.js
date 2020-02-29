import { sum, sumBy } from 'lodash';

import * as enums from '../destinyEnums';

import { modItemCategoryHashes } from './sockets';

/**
 * Generate a comparator from a mapping function.
 *
 * @example
 * // Returns a comparator that compares items by primary stat
 * compareBy((item) => item.primStat.value)
 */
export function compareBy(fn) {
  return (a, b) => {
    const aVal = fn(a);
    const bVal = fn(b);
    
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  };
}

function getPlugHashesFromCategory(category) {
  return category.sockets.map((socket) => socket.plug.plugItem?.hash || null).filter(Boolean);
}

/**
 * Gets all sockets that have a plug which doesn't get grouped in the Reusable socket category.
 * The reusable socket category is used in armor 1.0 for perks and stats.
 */
function getNonReuseableModSockets(sockets) {
  if (!sockets) {
    return [];
  }

  const reusableSocketCategory = sockets.socketCategories.find(
    (category) => category.category.categoryStyle === enums.DestinySocketCategoryStyle.Reusable
  );

  const reusableSocketHashes =
    (reusableSocketCategory && getPlugHashesFromCategory(reusableSocketCategory)) || [];

  return sockets.sockets.filter((socket) => {
    const plugItemHash = (socket.plug && socket.plug.plugItem.hash) || null;
    const categoryHashes = (socket.plug && socket.plug.plugItem.itemCategoryHashes) || [];
    return (
      categoryHashes.filter(hash => modItemCategoryHashes.includes(hash)).length > 0 &&
      !reusableSocketHashes.includes(plugItemHash)
    );
  });
}

export function getOrnamentSocket(sockets) {
  if (!sockets || !sockets.sockets) {
    return false;
  }

  return sockets.sockets.find(socket => socket.plug && socket.plug.plugItem && socket.plug.plugItem.itemSubType === enums.DestinyItemSubType.Ornament);
}

/**
 * Looks through the item sockets to find any weapon/armor mods that modify this stat.
 * Returns the total value the stat is modified by, or 0 if it is not being modified.
 */
export function getModdedStatValue(sockets, stat) {
  const modSockets = getNonReuseableModSockets(sockets).filter((socket) =>
    Object.keys(socket.plug.stats || {}).includes(String(stat.statHash))
  );

  // sum returns 0 for empty array
  return sum(
    modSockets.map((socket) => (socket.plug.stats ? socket.plug.stats[stat.statHash] : 0))
  );
}

export function getMasterworkSocketHashes(sockets, style) {
  const masterworkSocketCategory = sockets.socketCategories.find(
    (c) => c.category.categoryStyle === style
  );

  return (masterworkSocketCategory && getPlugHashesFromCategory(masterworkSocketCategory)) || [];
}

export function getSocketsWithStyle(sockets, style) {
  const masterworkSocketHashes = getMasterworkSocketHashes(sockets, style);
  return sockets.sockets.filter(
    (socket) => socket.plug && masterworkSocketHashes.includes(socket.plug.plugItem.hash)
  );
}

export function getSocketsWithPlugCategoryHash(sockets, categoryHash) {
  return sockets.sockets.filter((socket) => {
    const categoryHashes = socket.plug?.plugItem?.itemCategoryHashes;

    return categoryHashes && categoryHashes.includes(categoryHash);
  });
}

/**
 * Sums up all the armor statistics from the plug in the socket.
 */
export function getSumOfArmorStats(sockets, armorStatHashes) {
  return sumBy(sockets, (socket) =>
    sumBy(armorStatHashes, (armorStatHash) => (socket.plug && socket.plug.stats && socket.plug.stats[armorStatHash]) || 0)
  );
}