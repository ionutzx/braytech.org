import { compact, orderBy } from 'lodash';

import manifest from '../manifest';
import * as enums from '../destinyEnums';

import * as utils from './utils';

/**
 * These are the utilities that deal with Sockets and Plugs on items. Sockets and Plugs
 * are how perks, mods, and many other things are implemented on items.
 *
 * This is called from within d2-item-factory.service.ts
 */

/**
 * Plugs to hide from plug options (if not socketed)
 * removes the "Default Ornament" plug, "Default Shader" and "Rework Masterwork"
 * TODO: with AWA we may want to put some of these back
 */
const EXCLUDED_PLUGS = new Set([
  // Default ornament
  2931483505,
  1959648454,
  702981643,
  // Rework Masterwork
  39869035,
  1961001474,
  3612467353,
  // Default Shader
  4248210736
]);

// used in displaying the modded segments on item stats
export const modItemCategoryHashes = [
  1052191496, // weapon mods
  4062965806, // armor mods (pre-2.0)
  4104513227 // armor 2.0 mods
];

/** The item category hash for "intrinsic perk" */
export const INTRINSIC_PLUG_CATEGORY = 2237038328;
/** The item category hash for "masterwork mods" */
export const MASTERWORK_MOD_CATEGORY = 141186804;
/** The item category hash for "ghost projections" */
const GHOST_MOD_CATEGORY = 1404791674;

/** the default shader InventoryItem in every empty shader slot */
export const DEFAULT_SHADER = 4248210736;

/**
 * Calculate all the sockets we want to display (or make searchable). Sockets represent perks,
 * mods, and intrinsic properties of the item. They're really the swiss army knife of item
 * customization.
 */
export const sockets = item => {
  const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

  let sockets = null;
  let missingSockets = false;

  const socketData = (item.itemInstanceId && item.itemComponents?.sockets) || undefined;
  const reusablePlugData = (item.itemInstanceId && item.itemComponents?.reusablePlugs?.plugs) || undefined;
  const plugObjectivesData = (item.itemInstanceId && item.itemComponents?.plugObjectives?.objectivesPerPlug) || undefined;

  if (socketData) {
    sockets = buildInstancedSockets(item, socketData, reusablePlugData, plugObjectivesData);
  }

  // If we didn't have live data (for example, when viewing vendor items or collections),
  // get sockets from the item definition.
  if (!sockets && definitionItem?.sockets) {
    // If this really *should* have live sockets, but didn't...
    if (item.itemInstanceId && socketData && !socketData[item.itemInstanceId]) {
      missingSockets = true;
    }
    sockets = buildDefinedSockets(item);
  }

  return { ...sockets, missingSockets };
};

/**
 * Build information about an individual socket, and its plugs, using live information.
 */
function buildSocket(item, socket, socketDef, index, reusablePlugs, plugObjectivesData) {
  // if (
  //   !socketDef ||
  //   (!socket.isVisible &&
  //     // Keep the kill-tracker socket around even though it may not be visible
  //     // TODO: does this really happen? I think all these sockets are visible
  //     !(socket.plugHash && plugObjectivesData[socket.plugHash].length, (o) => o))
  // ) {
  //   return undefined;
  // }

  const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

  const socketTypeDef = manifest.DestinySocketTypeDefinition[socketDef.socketTypeHash];
  if (!socketTypeDef) {
    return undefined;
  }

  const socketCategoryDef = manifest.DestinySocketCategoryDefinition[socketTypeDef.socketCategoryHash];
  if (!socketCategoryDef) {
    return undefined;
  }

  // Is this socket a perk-style socket, or something more general (mod-like)?
  const isPerk = Boolean(socketCategoryDef.categoryStyle === enums.DestinySocketCategoryStyle.Reusable || (definitionItem.itemType === enums.DestinyItemType.Ghost && enums.DestinySocketCategoryStyle.Unlockable));

  // The currently equipped plug, if any.
  const plug = buildPlug(socket, socketDef, plugObjectivesData);

  // TODO: not sure if this should always be included!
  const plugOptions = plug ? [plug] : [];
  
  const isMasterwork = plug && Boolean(plug.plugItem?.plug?.plugCategoryIdentifier?.includes('masterworks.stat') || plug.plugItem?.plug?.plugCategoryIdentifier?.endsWith('_masterwork'));

  // We only build a larger list of plug options if this is a perk socket, since users would
  // only want to see (and search) the plug options for perks. For other socket types (mods, shaders, etc.)
  // we will only populate plugOptions with the currently inserted plug.
  if (isPerk) {
    if (reusablePlugs) {
      // This perk's list of plugs comes from the live reusablePlugs component.
      const reusableDimPlugs = reusablePlugs ? compact(reusablePlugs.map(reusablePlug => buildPlug(reusablePlug, socketDef, plugObjectivesData))) : [];

      if (reusableDimPlugs.length) {
        reusableDimPlugs.forEach(reusablePlug => {
          if (filterReusablePlug(reusablePlug)) {
            if (plug && reusablePlug.plugItem.hash === plug.plugItem.hash) {
              // Use the inserted plug we built earlier in this position, rather than the one we build from reusablePlugs.
              plugOptions.shift();
              plugOptions.push(plug);
            } else {
              // API Bugfix: Filter out intrinsic perks past the first: https://github.com/Bungie-net/api/issues/927
              if (!reusablePlug.plugItem.itemCategoryHashes || !reusablePlug.plugItem.itemCategoryHashes.includes(INTRINSIC_PLUG_CATEGORY)) {
                plugOptions.push(reusablePlug);
              }
            }
          }
        });
      }
    } else if (socketDef.reusablePlugItems) {
      // This perk's list of plugs come from the definition's list of items?
      // TODO: should we fill this in for perks?
    } else if (socketDef.reusablePlugSetHash) {
      // This perk's list of plugs come from a plugSet
      // TODO: should we fill this in for perks?
    }
  }
  // } else if (socketDef.reusablePlugItems?.length && isMasterwork) {
  //   socketDef.reusablePlugItems.forEach(reusablePlug => {
  //     if (!plugOptions.find(p => p.plugItem.hash === reusablePlug.plugItemHash)) {
  //       plugOptions.push(buildDefinedPlug(socketDef, reusablePlug));
  //     }
  //   });
  // }

  // TODO: is this still true?
  const hasRandomizedPlugItems = Boolean(socketDef && socketDef.randomizedPlugSetHash) || socketTypeDef.alwaysRandomizeSockets;

  const isIntrinsic = plug && Boolean(plug.plugItem?.itemCategoryHashes?.includes(2237038328));
  const isMod = plug && Boolean(plug.plugItem?.itemCategoryHashes?.filter(hash => modItemCategoryHashes.includes(hash)).length > 0);
  const isShader = plug && Boolean(plug.plugItem?.inventory?.bucketTypeHash === enums.DestinyInventoryBucket.Shaders);
  const isOrnament = plug && Boolean(plug.plugItem?.itemSubType === enums.DestinyItemSubType.Ornament && !EXCLUDED_PLUGS.has(plug.plugItem?.hash));
  const isTracker = plug && Boolean(plug.plugItem?.plug?.plugCategoryIdentifier?.includes('trackers'));

  return {
    socketIndex: index,
    plug,
    plugOptions,
    hasRandomizedPlugItems,
    isPerk,
    isIntrinsic,
    isMasterwork,
    isMod,
    isShader,
    isOrnament,
    isTracker,
    socketDefinition: socketDef
  };
}

/**
 * Build sockets that come from the live instance.
 */
export function buildInstancedSockets(item, sockets, reusablePlugData, plugObjectivesData) {
  const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

  if (!item.itemInstanceId || !definitionItem.sockets || !definitionItem.sockets.socketEntries.length || !sockets || !sockets.length) {
    return null;
  }

  const realSockets = sockets.map((socket, i) => buildSocket(item, socket, definitionItem.sockets.socketEntries[i], i, reusablePlugData && reusablePlugData[i], plugObjectivesData));

  const categories = definitionItem.sockets.socketCategories.map(category => {
    return {
      category: manifest.DestinySocketCategoryDefinition[category.socketCategoryHash],
      sockets: category.socketIndexes.map(index => realSockets[index]).filter(Boolean)
    };
  });

  return {
    sockets: realSockets.filter(Boolean), // Flat list of sockets
    socketCategories: orderBy(categories.sort(utils.compareBy(c => c.category.index)), [c => c.sockets.filter(s => s.isIntrinsic).length], ['desc']) // sockets organized by category then I force intrinsic-containing categories to top
  };
}

/**
 * Build sockets that come from only the definition. We won't be able to tell which ones are selected.
 */
function buildDefinedSockets(item) {
  const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

  if (!definitionItem.sockets.socketEntries || !definitionItem.sockets.socketEntries.length) {
    return null;
  }

  const realSockets = definitionItem.sockets.socketEntries.map((socket, i) => buildDefinedSocket(item, socket, i));
  // TODO: check out intrinsicsockets as well

  const categories = definitionItem.sockets.socketCategories.map(category => {
    return {
      category: manifest.DestinySocketCategoryDefinition[category.socketCategoryHash],
      sockets: compact(category.socketIndexes.map(index => realSockets[index])).filter(s => s.plugOptions.length)
    };
  });

  return {
    sockets: compact(realSockets), // Flat list of sockets
    socketCategories: orderBy(categories.sort(utils.compareBy(c => c.category.index)), [c => c.sockets.filter(s => s.isIntrinsic).length], ['desc']) // sockets organized by category then I force intrinsic-containing categories to top
  };
}

function buildDefinedSocket(item, socketDef, index) {
  const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

  if (!socketDef) {
    return undefined;
  }

  const socketTypeDef = manifest.DestinySocketTypeDefinition[socketDef.socketTypeHash];
  if (!socketTypeDef) {
    return undefined;
  }

  const socketCategoryDef = manifest.DestinySocketCategoryDefinition[socketTypeDef.socketCategoryHash];
  if (!socketCategoryDef) {
    return undefined;
  }

  // Is this socket a perk-style socket, or something more general (mod-like)?
  const isPerk = Boolean(socketCategoryDef.categoryStyle === enums.DestinySocketCategoryStyle.Reusable || (definitionItem.itemType === enums.DestinyItemType.Ghost && enums.DestinySocketCategoryStyle.Unlockable));

  const reusablePlugItems = (socketDef.reusablePlugSetHash && manifest.DestinyPlugSetDefinition[socketDef.reusablePlugSetHash] && manifest.DestinyPlugSetDefinition[socketDef.reusablePlugSetHash].reusablePlugItems) || [];

  const randomizedPlugs = (socketDef.randomizedPlugSetHash && manifest.DestinyPlugSetDefinition[socketDef.randomizedPlugSetHash] && manifest.DestinyPlugSetDefinition[socketDef.randomizedPlugSetHash].reusablePlugItems) || [];

  const reusablePlugs = compact(
    (socketDef.reusablePlugItems || [])
      .concat(reusablePlugItems)
      .concat(randomizedPlugs)
      .filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj.plugItemHash).indexOf(obj.plugItemHash) === pos;
      })
      .map(reusablePlug => buildDefinedPlug(socketDef, reusablePlug))
  );

  const plugOptions = [];

  if (reusablePlugs.length) {
    reusablePlugs.forEach(reusablePlug => {
      if (filterReusablePlug(reusablePlug)) {
        plugOptions.push(reusablePlug);
      }
    });
  }

  const plugItem = (socketDef.singleInitialItemHash && socketDef.singleInitialItemHash !== 0 && manifest.DestinyInventoryItemDefinition[socketDef.singleInitialItemHash]) || false;

  if (plugOptions.length < 1 && plugItem) {
    plugOptions.push(buildDefinedPlug(socketDef, { plugItemHash: plugItem.hash }));
  }

  const isIntrinsic = Boolean(plugOptions && plugOptions.find(o => o.isIntrinsic));
  const isMod = Boolean(plugOptions && plugOptions.find(o => o.isMod));
  const isShader = Boolean(plugOptions && plugOptions.find(o => o.isShader));
  const isOrnament = Boolean(plugOptions && plugOptions.find(o => o.isOrnament));
  const isTracker = Boolean(plugOptions && plugOptions.find(o => o.isTracker));
  
  return {
    socketIndex: index,
    plug: plugItem && {
      plugItem
    },
    plugOptions,
    hasRandomizedPlugItems: Boolean(socketDef.randomizedPlugSetHash) || socketTypeDef.alwaysRandomizeSockets,
    isPerk,
    isIntrinsic,
    isMasterwork: false,
    isMod,
    isShader,
    isOrnament,
    isTracker,
    socketDefinition: socketDef
  };
}

function buildPlug(plug, socketDef, plugObjectivesData) {
  const plugHash = isDestinyItemPlug(plug) ? plug.plugItemHash : plug.plugHash;
  const isEnabled = isDestinyItemPlug(plug) ? plug.enabled : plug.isEnabled;

  if (!plugHash) {
    return null;
  }

  let plugItem = manifest.DestinyInventoryItemDefinition[plugHash];
  if (!plugItem && socketDef.singleInitialItemHash) {
    plugItem = manifest.DestinyInventoryItemDefinition[socketDef.singleInitialItemHash];
  }

  if (!plugItem) {
    return null;
  }

  const failReasons = plug.enableFailIndexes ? plug.enableFailIndexes.map(index => plugItem.plug.enabledRules[index].failureMessage).join('\n') : '';

  return {
    plugItem,
    isEnabled: isEnabled && (!isDestinyItemPlug(plug) || plug.canInsert),
    enableFailReasons: failReasons,
    plugObjectives: (plugObjectivesData && plugObjectivesData[plugHash]) || [],
    perks: plugItem.perks ? plugItem.perks.map(perk => manifest.DestinySandboxPerkDefinition[perk.perkHash]) : [],
    stats: null
  };
}

function buildDefinedPlug(socketDef, plug) {
  const plugHash = isDestinyItemPlug(plug) ? plug.plugItemHash : plug.plugHash;

  const definitionPlugItem = plug && manifest.DestinyInventoryItemDefinition[plug.plugItemHash];

  if (!plugHash || !definitionPlugItem) {
    return null;
  }

  const isActive = Boolean(socketDef.singleInitialItemHash && socketDef.singleInitialItemHash === plugHash);
  const isIntrinsic = Boolean(definitionPlugItem.itemCategoryHashes && definitionPlugItem.itemCategoryHashes.includes(2237038328));
  const isMod = Boolean(definitionPlugItem.itemCategoryHashes && definitionPlugItem.itemCategoryHashes.filter(hash => modItemCategoryHashes.includes(hash)).length > 0);
  const isShader = Boolean(definitionPlugItem.inventory && definitionPlugItem.inventory.bucketTypeHash === enums.DestinyInventoryBucket.Shaders);
  const isOrnament = Boolean(definitionPlugItem.itemSubType === enums.DestinyItemSubType.Ornament && !EXCLUDED_PLUGS.has(definitionPlugItem.hash));
  const isTracker = Boolean(definitionPlugItem.plug && definitionPlugItem.plug.plugCategoryIdentifier && definitionPlugItem.plug.plugCategoryIdentifier.includes('trackers'));

  return {
    plugItem: definitionPlugItem,
    isEnabled: true,
    isActive,
    isIntrinsic,
    isMod,
    isShader,
    isOrnament,
    isTracker,
    enableFailReasons: '',
    plugObjectives: [],
    perks: (definitionPlugItem.perks || []).map(perk => manifest.DestinySandboxPerkDefinition[perk.perkHash]),
    stats: null
  };
}

function filterReusablePlug(reusablePlug) {
  const itemCategoryHashes = reusablePlug.plugItem.itemCategoryHashes || [];

  return !EXCLUDED_PLUGS.has(reusablePlug.plugItem.hash) && !itemCategoryHashes.includes(MASTERWORK_MOD_CATEGORY) && !itemCategoryHashes.includes(GHOST_MOD_CATEGORY) && (!reusablePlug.plugItem.plug || !reusablePlug.plugItem.plug.plugCategoryIdentifier.includes('masterworks.stat'));
}

function isDestinyItemPlug(plug) {
  return Boolean(plug.plugItemHash);
}
