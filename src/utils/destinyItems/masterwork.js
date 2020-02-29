import manifest from '../manifest';
import * as enums from '../destinyEnums';

/**
 * These are the utilities that deal with figuring out Masterwork info.
 *
 * This is called from within d2-item-factory.service.ts
 */

// const resistanceMods = {
//   1546607977: DamageType.Kinetic,
//   1546607980: DamageType.Void,
//   1546607978: DamageType.Arc,
//   1546607979: DamageType.Thermal
// };

/**
 * This builds the masterwork info - this isn't whether an item is masterwork, but instead what
 * "type" of masterwork it is, what the kill tracker value is, etc. Exotic weapons can start having
 * kill trackers before they're masterworked.
 */
export const masterwork = item => {
  if (!item.sockets) {
    return null;
  }

  let masterworkInfo = null;

  // Pre-Forsaken Masterwork
  if (enums.enumerateItemState(item.state).masterworked) {
    masterworkInfo = buildMasterworkInfo(item.sockets);
  }

  // Forsaken Masterwork
  if (!masterworkInfo) {
    masterworkInfo = buildForsakenMasterworkInfo(item);
  }

  return masterworkInfo;
}

/**
 * Post-Forsaken weapons store their masterwork info and kill tracker on different plugs.
 */
function buildForsakenMasterworkInfo(item) {
  const masterworkStats = buildForsakenMasterworkStats(item);
  const killTracker = buildForsakenKillTracker(item);

  // not all masterworks have masterworked stats i.e. outbreak prime
  if (killTracker) {
    return { ...masterworkStats, objective: killTracker };
  }

  return masterworkStats || null;
}

function buildForsakenKillTracker(item) {
  const killTrackerSocket = item.sockets.sockets?.find((socket) => socket.plug?.plugObjectives?.length);

  if (killTrackerSocket) {
    const plugObjective = killTrackerSocket.plug.plugObjectives[0];

    const objectiveDef = manifest.DestinyObjectiveDefinition[plugObjective.objectiveHash];

    return {
      progress: plugObjective.progress,
      typeIcon: objectiveDef.displayProperties.icon,
      typeDesc: objectiveDef.progressDescription,
      typeName: [3244015567, 2285636663, 38912240].includes(killTrackerSocket.plug.plugItem.hash)
        ? 'crucible'
        : 'vanguard'
    };
  }

  return null;
}

function buildForsakenMasterworkStats(item) {
  const index = item.sockets.sockets && item.sockets.sockets.findIndex((socket) =>
    Boolean(
      socket.plug?.plugItem?.plug &&
        (socket.plug.plugItem.plug.plugCategoryIdentifier.includes('masterworks.stat') ||
          socket.plug.plugItem.plug.plugCategoryIdentifier.endsWith('_masterwork'))
    )
  );

  const socket = item.sockets.sockets && item.sockets.sockets[index];
  
  if (socket?.plug?.plugItem?.investmentStats?.length) {

    socket.isMasterwork = true;

    const masterwork = socket.plug.plugItem.investmentStats[0];

    return {
      socketIndex: index,
      stats: [
        {
          hash: masterwork.statTypeHash,
          value: socket.plug.stats
          ? socket.plug.stats[masterwork.statTypeHash]
          : (socket.plugOptions.find(p => p.plugItem.hash === socket.plug.plugItem.hash) && socket.plugOptions.find(p => p.plugItem.hash === socket.plug.plugItem.hash).stats[masterwork.statTypeHash]) || 0
        }
      ],
      objective: {
        typeName: 'vanguard',
        typeIcon: socket.plug.plugItem.displayProperties.icon,
        typeDesc: socket.plug.plugItem.displayProperties.description
      }
    };
  }

  return null;
}

/**
 * Pre-Forsaken weapons store their masterwork info on an objective of a plug.
 */
function buildMasterworkInfo(sockets) {
  const index = sockets.sockets.findIndex((socket) =>
    Boolean(socket?.plug?.plugObjectives?.length)
  );

  const socket = sockets.sockets[index];

  if (!socket?.plug?.plugObjectives?.length) {
    return null;
  }

  const plugObjective = socket.plug.plugObjectives[0];
  
  const investmentStats = socket.plug.plugItem.investmentStats;
  if (!investmentStats || !investmentStats.length) {
    return null;
  }

  const statHash = investmentStats[0].statTypeHash;

  const objectiveDef = manifest.DestinyObjectiveDefinition[plugObjective.objectiveHash];
  const statDef = manifest.DestinyStatDefinition[statHash];

  if (!objectiveDef || !statDef) {
    return null;
  }

  socket.isMasterwork = true;
console.log(socket.plug.plugItem.plug.plugCategoryHash === 2109207426 ? 'vanguard' : 'crucible')
  return {
    socketIndex: index,
    stats: investmentStats.map(s => ({
      hash: s.statTypeHash,
      value: socket.plug.stats[s.statTypeHash] || 0,
    })),
    objective: {
      progress: plugObjective.progress,
      typeName: socket.plug.plugItem.plug.plugCategoryHash === 2109207426 ? 'vanguard' : 'crucible',
      typeIcon: objectiveDef.displayProperties.icon,
      typeDesc: objectiveDef.progressDescription
    }
  };
}
