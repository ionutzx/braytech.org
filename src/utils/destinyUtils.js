import { once } from 'lodash';
import i18n from 'i18next';

import manifest from './manifest';
import * as enums from './destinyEnums';

export const isProfileRoute = location => location.pathname.match(/\/(?:[1|2|3|4|5])\/(?:[0-9]+)\/(?:[0-9]+)/);

export function totalValor() {
  return Object.keys(manifest.DestinyProgressionDefinition[2626549951].steps).reduce((sum, key) => {
    return sum + manifest.DestinyProgressionDefinition[2626549951].steps[key].progressTotal;
  }, 0);
}

export function totalGlory() {
  return Object.keys(manifest.DestinyProgressionDefinition[2000925172].steps).reduce((sum, key) => {
    return sum + manifest.DestinyProgressionDefinition[2000925172].steps[key].progressTotal;
  }, 0);
}

export function totalInfamy() {
  return Object.keys(manifest.DestinyProgressionDefinition[2772425241].steps).reduce((sum, key) => {
    return sum + manifest.DestinyProgressionDefinition[2772425241].steps[key].progressTotal;
  }, 0);
}

export function commonality(players = 0) {
  return players / (manifest.statistics.scrapes?.last?.members || 10 * 10000) * 100;
}

export function collectionTotal(data) {
  if (!data.profileCollectibles || !data.characterCollectibles) {
    console.warn('No data provided to destinyUtils.collectionTotal');
    return '0';
  }

  let collectionTotal = 0;
  let profileTempCollections = {};

  for (const [hash, collectible] of Object.entries(data.profileCollectibles.data.collectibles)) {
    let collectibleState = enums.enumerateCollectibleState(collectible.state);
    if (!collectibleState.notAcquired) {
      if (!profileTempCollections[hash]) {
        profileTempCollections[hash] = 1;
      }
    }
  }

  for (const [characterId, character] of Object.entries(data.characterCollectibles.data)) {
    for (const [hash, collectible] of Object.entries(character.collectibles)) {
      let collectibleState = enums.enumerateCollectibleState(collectible.state);
      if (!collectibleState.notAcquired) {
        if (!profileTempCollections[hash]) {
          profileTempCollections[hash] = 1;
        }
      }
    }
  }

  for (const [hash, collectible] of Object.entries(profileTempCollections)) {
    collectionTotal++;
  }

  return collectionTotal;
}

export const calculateResets = (progressionHash, characterId, characterProgressions, characterRecords, profileRecords) => {
  if (progressionHash === 2626549951) {
    // if valor adjust hash
    progressionHash = 3882308435;
  }
  
  const infamySeasons = [{ recordHash: 3901785488, objectiveHash: 4210654397 }].map(season => {
    const definitionRecord = manifest.DestinyRecordDefinition[season.recordHash];

    const recordScope = definitionRecord.scope || 0;
    const recordData = recordScope === 1 ? characterRecords && characterRecords[characterId].records[definitionRecord.hash] : profileRecords && profileRecords[definitionRecord.hash];

    season.resets = (recordData && recordData.objectives && recordData.objectives.find(o => o.objectiveHash === season.objectiveHash) && recordData.objectives.find(o => o.objectiveHash === season.objectiveHash).progress) || 0;

    return season;
  });

  const valorSeasons = [
    {
      recordHash: 1341325320,
      objectiveHash: 1089010148
    },
    {
      recordHash: 2462707519,
      objectiveHash: 2048068317
    },
    {
      recordHash: 3666883430,
      objectiveHash: 3211089622
    },
    {
      recordHash: 2110987253,
      objectiveHash: 1898743615
    },
    {
      recordHash: 510151900,
      objectiveHash: 2011701344
    },
    {
      recordHash: 2282573299,
      objectiveHash: 18453481
    }
  ].map(season => {
    const definitionRecord = manifest.DestinyRecordDefinition[season.recordHash];

    const recordScope = definitionRecord.scope || 0;
    const recordData = recordScope === 1 ? characterRecords && characterRecords[characterId].records[definitionRecord.hash] : profileRecords && profileRecords[definitionRecord.hash];

    season.resets = (recordData && recordData.objectives && recordData.objectives.find(o => o.objectiveHash === season.objectiveHash) && recordData.objectives.find(o => o.objectiveHash === season.objectiveHash).progress) || 0;

    return season;
  });

  return {
    resetsSeason: characterProgressions[characterId].progressions[progressionHash] && Number.isInteger(characterProgressions[characterId].progressions[progressionHash].currentResetCount) ? characterProgressions[characterId].progressions[progressionHash].currentResetCount : '?',
    // total:
    //   characterProgressions[characterId].progressions[progressionHash] && characterProgressions[characterId].progressions[progressionHash].seasonResets
    //     ? characterProgressions[characterId].progressions[progressionHash].seasonResets.reduce((acc, curr) => {
    //         if (curr.season > 3) {
    //           return acc + curr.resets;
    //         } else {
    //           return acc;
    //         }
    //       }, 0)
    //     : '?'
    resetsTotal: (progressionHash === 3882308435 ? valorSeasons : infamySeasons).reduce((a, v) => a + v.resets, 0)
  };
};

export function progressionSeasonRank(member) {
  if (!member?.data || !member.data.profile?.characterProgressions?.data || !member.data.profile?.characters?.data) {
    console.warn('No member data provided');
    
    return false;
  }

  const definitionSeason = manifest.DestinySeasonDefinition[manifest.settings.destiny2CoreSettings.currentSeasonHash];
  const definitionSeasonPass = manifest.DestinySeasonPassDefinition[definitionSeason.seasonPassHash];

  const characterId = member.characterId || member.data.profile.characters.data[0].characterId;

  const progressionHash = member.data.profile.characterProgressions.data[characterId]?.progressions[definitionSeasonPass.rewardProgressionHash]?.level === member.data.profile.characterProgressions.data[characterId]?.progressions[definitionSeasonPass.rewardProgressionHash]?.levelCap ? definitionSeasonPass.prestigeProgressionHash : definitionSeasonPass.rewardProgressionHash;

  const progression = {
    ...member.data.profile.characterProgressions.data[characterId].progressions[progressionHash]
  };

  if (progressionHash === definitionSeasonPass.prestigeProgressionHash) {
    progression.level += 100;
  }
  
  return progression;
}

/**
 * Convert a gender type to english string
 * @param type Destiny gender type
 * @return english string representation of type
 */
export function genderTypeToString(type) {
  let string;

  switch (type) {
    case 0:
      string = 'Male';
      break;
    case 1:
      string = 'Female';
      break;
    default:
      string = 'uh oh';
  }

  return string;
}

export function groupMemberTypeToString(str) {
  let string;

  switch (str) {
    case 1:
      string = 'Beginner';
      break;
    case 2:
      string = 'Member';
      break;
    case 3:
      string = 'Admin';
      break;
    case 4:
      string = 'Acting Founder';
      break;
    case 5:
      string = 'Founder';
      break;
    default:
      string = 'None';
  }

  return string;
}

export function raceTypeToString(str) {
  let string;

  switch (str) {
    case 0:
      string = 'Human';
      break;
    case 1:
      string = 'Awoken';
      break;
    case 2:
      string = 'Exo';
      break;
    default:
      string = 'uh oh';
  }

  return string;
}

export const gameVersion = (versionsOwned, versionHash) => {
  const owned = versionsOwned && enums.enumerateDestinyGameVersions(versionsOwned)

  if (versionHash === 'base') {
    return {
      hash: 'base',
      unlock: {
        text: 'Requires Destiny 2'
      },
      eligible: owned[versionHash],
      displayProperties: {
        icon: 'destiny-campaign_red-war'
      }
    }
  } else if (versionHash === 'osiris') {
    return {
      hash: 'osiris',
      unlock: {
        text: i18n.t('Requires Destiny 2: Curse of Osiris')
      },
      eligible: owned[versionHash],
      displayProperties: {
        icon: 'destiny-campaign_curse-of-osiris'
      }
    }
  } else if (versionHash === 'warmind') {
    return {
      hash: 'warmind',
      unlock: {
        text: i18n.t('Requires Destiny 2: Warmind')
      },
      eligible: owned[versionHash],
      displayProperties: {
        icon: 'destiny-campaign_warmind'
      }
    }
  } else if (versionHash === 'forsaken') {
    return {
      hash: 'forsaken',
      unlock: {
        text: i18n.t('Requires Destiny 2: Forsaken')
      },
      eligible: owned[versionHash],
      displayProperties: {
        icon: 'destiny-campaign_forsaken'
      }
    }
  } else if (versionHash === 'shadowkeep') {
    return {
      hash: 'shadowkeep',
      unlock: {
        text: i18n.t('Requires Destiny 2: Shadowkeep')
      },
      eligible: owned[versionHash],
      displayProperties: {
        icon: 'destiny-campaign_shadowkeep'
      }
    }
  } else {
    return {
      hash: '',
      unlock: {
        text: ''
      },
      displayProperties: {
        icon: false
      }
    }
  }
}

export function classHashToString(hash, gender) {
  const definitionClass = manifest.DestinyClassDefinition[hash];

  if (!definitionClass) return '';

  if (definitionClass.genderedClassNames && gender) {
    if (gender > -1 && gender < 2) {
      return definitionClass.genderedClassNames[gender === 1 ? 'Female' : 'Male'];
    } else {
      return definitionClass.genderedClassNamesByGenderHash[gender];
    }
  }

  return definitionClass.displayProperties.name;
}

export function classTypeToString(type, gender) {
  const classHash = Object.keys(manifest.DestinyClassDefinition).find(key => manifest.DestinyClassDefinition[key].classType === type);

  return classHashToString(classHash, gender);
}

export function raceHashToString(hash, gender, nonGendered = false) {
  const definitionRace = manifest.DestinyRaceDefinition[hash];

  if (!definitionRace) return '';

  if (definitionRace.genderedRaceNames && !nonGendered) {
    return definitionRace.genderedRaceNames[gender === 1 ? 'Female' : 'Male'];
  }

  return definitionRace.displayProperties.name;
}

export function membershipTypeToString(str, short = false) {
  let string;

  if (short) {
    switch (str) {
      case 1:
        string = 'XB';
        break;
      case 2:
        string = 'PS';
        break;
      case 4:
        string = 'PC';
        break;
      default:
        string = '??';
    }
  } else {
    switch (str) {
      case 1:
        string = 'Xbox';
        break;
      case 2:
        string = 'PlayStation';
        break;
      case 4:
        string = 'PC';
        break;
      default:
        string = 'uh oh';
    }
  }

  return string;
}

export function damageTypeToAsset(type) {
  let string;
  let char;

  switch (type) {
    case 3373582085:
      string = 'kinetic';
      char = '';
      break;
    case 1847026933:
      string = 'solar';
      char = '';
      break;
    case 2303181850:
      string = 'arc';
      char = '';
      break;
    case 3454344768:
      string = 'void';
      char = '';
      break;
    default:
      string = '';
      char = '';
  }

  return {
    string,
    char
  };
}

export function energyTypeToAsset(type) {
  let string;
  let char;

  switch (type) {
    case 591714140:
      string = 'solar';
      char = '';
      break;
    case 728351493:
      string = 'arc';
      char = '';
      break;
    case 4069572561:
      string = 'void';
      char = '';
      break;
    case 1198124803:
      string = 'any';
      char = '';
      break;
    default:
      string = '';
      char = '';
  }

  return {
    string,
    char
  };
}

export function energyStatToType(statHash) {
  let typeHash;

  switch (statHash) {
    case 3625423501:
      typeHash = 728351493; // arc
      break;
    case 16120457:
      typeHash = 4069572561; // void
      break;
    default:
      typeHash = 591714140; // solar
  }

  return typeHash;
}

export function breakerTypeToIcon(type) {
  let icon;

  switch (type) {
    case 3178805705:
      icon = '';
      break;
    case 485622768:
      icon = '';
      break;
    case 2611060930:
      icon = '';
      break;
    default:
      icon = '';
  }

  return icon;
}

export function itemRarityToString(tierType) {
  let string;

  switch (tierType) {
    case 6:
      string = 'exotic';
      break;
    case 5:
      string = 'legendary';
      break;
    case 4:
      string = 'rare';
      break;
    case 3:
      string = 'uncommon';
      break;
    case 2:
      string = 'common';
      break;
    default:
      string = 'common';
  }

  return string;
}

function getSubclassPath(gridDef, talentGrid) {
  let activatedNodes = talentGrid.nodes.filter(node => node.isActivated).map(node => node.nodeIndex);
  let selectedSkills = gridDef.nodeCategories.filter(category => {
    var overlapping = category.nodeHashes.filter(nodeHash => activatedNodes.indexOf(nodeHash) > -1);
    return overlapping.length > 0;
  });
  let subclassPath = selectedSkills.find(nodeDef => nodeDef.isLoreDriven);
  return subclassPath;
}

export function getSubclassPathInfo(itemComponents, itemData) {
  if (!itemComponents || !itemComponents.talentGrids || !itemData) {
    console.warn('data missing');
    return false;
  }

  const classTypes = { Titan: 0, Hunter: 1, Warlock: 2 };
  const damageTypes = { Arc: 2, Thermal: 3, Void: 4 };
  const identifiers = { First: 'FirstPath', Second: 'SecondPath', Third: 'ThirdPath' };

  const pathsCustomInfo = [
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Arc,
      identifier: identifiers.First,
      sandboxPerk: 113667234,
      icon: '',
      art: '01A3-0000112B'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Arc,
      identifier: identifiers.Second,
      sandboxPerk: 113667234,
      icon: '',
      art: '01A3-0000112B'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Arc,
      identifier: identifiers.Third,
      sandboxPerk: 3326771373,
      icon: '',
      art: '01E3-00001598'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Thermal,
      identifier: identifiers.First,
      sandboxPerk: 3881209933,
      icon: '',
      art: '01A3-0000116E'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Second,
      sandboxPerk: 3881209933,
      icon: '',
      art: '01A3-0000116E'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Third,
      sandboxPerk: 2401205106,
      icon: '',
      art: '01E3-0000159D'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Void,
      identifier: identifiers.First,
      sandboxPerk: 3170765412,
      icon: '',
      art: '01A3-00001179'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Void,
      identifier: identifiers.Second,
      sandboxPerk: 3078264658,
      icon: '',
      art: '01A3-00001179'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Void,
      identifier: identifiers.Third,
      sandboxPerk: 3112248479,
      icon: '',
      art: '01E3-0000159F'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Arc,
      identifier: identifiers.First,
      sandboxPerk: 674606208,
      icon: '',
      art: '01A3-000010B4'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Arc,
      identifier: identifiers.Second,
      sandboxPerk: 674606208,
      icon: '',
      art: '01A3-000010B4'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Arc,
      identifier: identifiers.Third,
      sandboxPerk: 2236497009,
      icon: '',
      art: '01E3-00001593'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Thermal,
      identifier: identifiers.First,
      sandboxPerk: 3205500087,
      icon: '',
      art: '01A3-000010F8'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Second,
      sandboxPerk: 3205500087,
      icon: '',
      art: '01A3-000010F8'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Third,
      sandboxPerk: 2041340886,
      icon: '',
      art: '01E3-00001595'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Void,
      identifier: identifiers.First,
      sandboxPerk: 2999301420,
      icon: '',
      art: '01A3-00001107'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Void,
      identifier: identifiers.Second,
      sandboxPerk: 2999301420,
      icon: '',
      art: '01A3-00001107'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Void,
      identifier: identifiers.Third,
      sandboxPerk: 4099200371,
      icon: '',
      art: '01E3-00001596'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Arc,
      identifier: identifiers.First,
      sandboxPerk: 803974717,
      icon: '',
      art: '01A3-000011A1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Arc,
      identifier: identifiers.Second,
      sandboxPerk: 803974717,
      icon: '',
      art: '01A3-000011A1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Arc,
      identifier: identifiers.Third,
      sandboxPerk: 3368836162,
      icon: '',
      art: '01E3-000015A1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Thermal,
      identifier: identifiers.First,
      sandboxPerk: 1136882502,
      icon: '',
      art: '01A3-000011F1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Second,
      sandboxPerk: 1136882502,
      icon: '',
      art: '01A3-000011F1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Third,
      sandboxPerk: 1267155257,
      icon: '',
      art: '01E3-000015A2'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Void,
      identifier: identifiers.First,
      sandboxPerk: 195170165,
      icon: '',
      art: '01A3-0000120D'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Void,
      identifier: identifiers.Second,
      sandboxPerk: 3959434990,
      icon: '',
      art: '01A3-0000120D'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Void,
      identifier: identifiers.Third,
      sandboxPerk: 3247948194,
      icon: '',
      art: '01E3-000015A5'
    }
  ];

  const definitionItem = manifest.DestinyInventoryItemDefinition[itemData.itemHash];
  const definitionTalentGrid = manifest.DestinyTalentGridDefinition[itemComponents.talentGrids.talentGridHash];
  const damageNames = ['', '', 'arc', 'solar', 'void'];
  const damageType = definitionItem.talentGrid.hudDamageType;

  let activeTalentPath = getSubclassPath(definitionTalentGrid, itemComponents.talentGrids);

  if (activeTalentPath == null) {
    activeTalentPath = { displayProperties: { name: 'Unknown' }, identifier: 'FirstPath' };
  }

  const pathCustom = pathsCustomInfo.find(p => p.classType === definitionItem.classType && p.damageType === damageType && p.identifier === activeTalentPath.identifier);
  
  const path = {
    name: activeTalentPath.displayProperties.name,
    element: damageNames[definitionItem.talentGrid.hudDamageType],
    art: pathCustom.art,
    super: {
      name: pathCustom.sandboxPerk && manifest.DestinySandboxPerkDefinition[pathCustom.sandboxPerk].displayProperties.name,
      description: pathCustom.sandboxPerk && manifest.DestinySandboxPerkDefinition[pathCustom.sandboxPerk].displayProperties.description,
      icon: pathCustom.icon,
      hash: pathCustom.sandboxPerk
    }
  };

  return path;
}

export function ammoTypeToAsset(type) {
  let string;
  let icon;

  switch (type) {
    case 1:
      string = manifest.DestinyPresentationNodeDefinition[1731162900]?.displayProperties?.name;
      break;
    case 2:
      string = manifest.DestinyPresentationNodeDefinition[638914517]?.displayProperties?.name;
      break;
    case 3:
      string = manifest.DestinyPresentationNodeDefinition[3686962409]?.displayProperties?.name;
      break;
    default:
      string = '';
  }

  return {
    string,
    icon
  };
}

// matches first bracketed thing in the string, or certain private unicode characters
const iconPlaceholder = /(\[[^\]]+\]|[\uE000-\uF8FF])/g;

const baseConversionTable = [
  // Damage Types
  { objectiveHash: 2178780271, unicode: '', substring: null },
  { objectiveHash:  400711454, unicode: '', substring: null },
  { objectiveHash: 2994623161, unicode: '', substring: null },
  { objectiveHash: 1554970245, unicode: '', substring: null },
  // Precision
  { objectiveHash:  437290134, unicode: '', substring: null },
  // Abilities
  { objectiveHash:  314405660, unicode: '', substring: null },
  { objectiveHash: 3711356257, unicode: '', substring: null },
  // All Rifle-class
  { objectiveHash:  532914921, unicode: '', substring: null },
  { objectiveHash: 2161000034, unicode: '', substring: null },
  { objectiveHash: 2062881933, unicode: '', substring: null },
  { objectiveHash: 3527067345, unicode: '', substring: null },
  { objectiveHash: 3296270292, unicode: '', substring: null },
  { objectiveHash: 3080184954, unicode: '', substring: null },
  { objectiveHash: 3373536132, unicode: '', substring: null },
  // Remaining weapons, that are not heavy
  { objectiveHash:   53304862, unicode: '', substring: null },
  { objectiveHash:  635284441, unicode: '', substring: null },
  { objectiveHash: 2722409947, unicode: '', substring: null },
  { objectiveHash: 1242546978, unicode: '', substring: null },
  { objectiveHash:  299893109, unicode: '', substring: null },
  { objectiveHash: 2258101260, unicode: '', substring: null },
  // Heavy Weapons
  { objectiveHash: 2152699013, unicode: '', substring: null },
  { objectiveHash: 2203404732, unicode: '', substring: null },
  { objectiveHash: 1788114534, unicode: '', substring: null },
  { objectiveHash:  989767424, unicode: '', substring: null },
  // Artifacts that can be picked up and used as weapons
  { objectiveHash: 4231452845, unicode: '', substring: null },
  // Gambit - Blockers
  { objectiveHash:  276438067, unicode: '', substring: null },
  { objectiveHash: 3792840449, unicode: '', substring: null },
  { objectiveHash: 2031240843, unicode: '', substring: null },
  // Quest Markers
  { objectiveHash: 3915460773, unicode: '', substring: null },
  // Breakers
  { sandboxPerk: 3068403538, unicode: '', substring: null },
  { sandboxPerk: 2678922819, unicode: '', substring: null },
  { sandboxPerk: 3879088617, unicode: '', substring: null }
];

/**
 * given defs, uses known examples from the manifest
 * and returns a localized string-to-icon conversion table
 *           "[Rocket Launcher]" -> <svg>
 */
const generateConversionTable = once(() => {
  // loop through conversionTable entries to update them with manifest string info
  baseConversionTable.forEach((iconEntry) => {
    const def = (iconEntry.sandboxPerk && manifest.DestinySandboxPerkDefinition[iconEntry.sandboxPerk]) || manifest.DestinyObjectiveDefinition[iconEntry.objectiveHash];
    if (!def) {
      return;
    }
    const string = def.progressDescription || def.displayProperties.description;
    // lookup this lang's string for the objective
    const progressDescriptionMatch = string.match(iconPlaceholder);
    const iconString = progressDescriptionMatch && progressDescriptionMatch[0];
    // this language's localized replacement, which we will detect and un-replace back into an icon
    iconEntry.substring = iconString;
  });
  return baseConversionTable;
});

const replaceWithIcon = (conversionRules, textSegment) => {
  const replacement = conversionRules.find(
    (r) => r.substring === textSegment || r.unicode === textSegment
  );
  return (replacement && replacement.unicode) || textSegment;
};

export function stringToIcons(string) {
  // powered by DIM brilliance: @delphiactual, @sundevour, @bhollis
  // https://github.com/DestinyItemManager/DIM/blob/master/src/app/progress/ObjectiveDescription.tsx

  return string
    .split(iconPlaceholder)
    .filter(Boolean)
    .map(t => replaceWithIcon(generateConversionTable(), t));
}

// thank you DIM (https://github.com/DestinyItemManager/DIM/blob/master/src/app/inventory/store/well-rested.ts)
export function isWellRested(characterProgression) {
  // We have to look at both the regular progress and the "legend" levels you gain after hitting the cap.
  // Thanks to expansions that raise the level cap, you may go back to earning regular XP after getting legend levels.
  const levelProgress = characterProgression.progressions[1716568313];
  const legendProgressDef = manifest.DestinyProgressionDefinition[2030054750];
  const legendProgress = characterProgression.progressions[2030054750];

  // You can only be well-rested if you've hit the normal level cap.
  // And if you haven't ever gained 3 legend levels, no dice.
  if (levelProgress.level < levelProgress.levelCap || legendProgress.level < 4) {
    return {
      wellRested: false
    };
  }

  const progress = legendProgress.weeklyProgress;

  const requiredXP = xpRequiredForLevel(legendProgress.level, legendProgressDef) + xpRequiredForLevel(legendProgress.level - 1, legendProgressDef) + xpRequiredForLevel(legendProgress.level - 2, legendProgressDef);

  // Have you gained XP equal to three full levels worth of XP?
  return {
    wellRested: progress < requiredXP,
    progress,
    requiredXP
  };
}

/**
 * How much XP was required to achieve the given level?
 */
function xpRequiredForLevel(level, progressDef) {
  const stepIndex = Math.min(Math.max(0, level), progressDef.steps.length - 1);
  return progressDef.steps[stepIndex].progressTotal;
}

export function lastPlayerActivity(member) {

  if (!member.profile || (!member.profile.characterActivities.data || !member.profile.characters.data.length)) {
    return [{}];
  }

  return member.profile.characters.data.map(character => {

    const lastActivity = member.profile.characterActivities.data[character.characterId];

    // small adjustment to Garden of Salvation
    // https://github.com/Bungie-net/api/issues/1184
    if (lastActivity.currentActivityModeHash === 2166136261) {
      lastActivity.currentActivityModeHash = 2043403989;
    }

    const definitionActivity = lastActivity.currentActivityHash && manifest.DestinyActivityDefinition[lastActivity.currentActivityHash];
    const definitionActivityMode =  lastActivity.currentActivityModeHash && manifest.DestinyActivityModeDefinition[lastActivity.currentActivityModeHash];
    const definitionPlace = definitionActivity.placeHash && manifest.DestinyPlaceDefinition[definitionActivity.placeHash];
    const definitionPlaceOrbit = manifest.DestinyPlaceDefinition[2961497387];
    const definitionActivityPlaylist = lastActivity.currentPlaylistActivityHash && manifest.DestinyActivityDefinition[lastActivity.currentPlaylistActivityHash];
    
    let lastActivityString = false;
    if (definitionActivity && !definitionActivity.redacted) {
      if (definitionActivity.activityTypeHash === 400075666) { // Menagerie

        lastActivityString = `${definitionActivity.selectionScreenDisplayProperties?.name ? definitionActivity.selectionScreenDisplayProperties.name : definitionActivity.displayProperties && definitionActivity.displayProperties.name}`;

      } else if (lastActivity.currentActivityModeHash === 547513715 && enums.ordealHashes.includes(lastActivity.currentActivityHash)) { // Nightfall ordeals

        lastActivityString = definitionActivity.displayProperties.name;

      } else if (lastActivity.currentActivityModeHash === 547513715) { // Scored Nightfall Strikes

        lastActivityString = definitionActivity.selectionScreenDisplayProperties?.name ? `${definitionActivityMode.displayProperties.name}: ${definitionActivity.selectionScreenDisplayProperties.name}` : `${definitionActivityMode.displayProperties.name}: ${definitionActivity.displayProperties.name}`;

      } else if (lastActivity.currentActivityModeHash === 2319502047) { // The Sundial

        lastActivityString = `${definitionActivity.displayProperties.name}`;

      } else if (definitionActivity.activityTypeHash === 838603889) { // Forge Ignition

        lastActivityString = `${definitionActivity.displayProperties.name}: ${definitionActivityPlaylist.displayProperties.name}`;

      } else if (definitionPlace && definitionActivity.placeHash === 4148998934) { // The Reckoning

        lastActivityString = `${definitionActivity.displayProperties.name}`;

      } else if (lastActivity.currentActivityModeTypes?.indexOf(5) > -1) { // Crucible

        lastActivityString = `${manifest.DestinyActivityModeDefinition[1164760504].displayProperties.name}: ${definitionActivityPlaylist.displayProperties.name}: ${definitionActivity.displayProperties.name}`;

      } else if ([135537449, 740891329].includes(lastActivity.currentPlaylistActivityHash)) { // Survival, Survival: Freelance

        lastActivityString = `${definitionActivityPlaylist.displayProperties.name}: ${definitionActivity.displayProperties.name}`;

      } else if (definitionActivity?.activityTypeHash === 332181804) { // Nightmare Hunts
        
        lastActivityString = definitionActivity.displayProperties.name;

      } else if (definitionActivityPlaylist?.hash === 2032534090) { // Convert Story: The Shattered Throne -> Dungeon: The Shattered Throne
        
        lastActivityString = `${manifest.DestinyActivityTypeDefinition[608898761].displayProperties.name}: ${definitionActivity.displayProperties.name}`;

      } else if (definitionActivityMode && definitionActivity?.placeHash !== 2961497387) { // Default
        
        lastActivityString = `${definitionActivityMode.displayProperties.name}: ${definitionActivity.displayProperties.name}`;

      } else if (definitionActivity.placeHash === 2961497387) { // Orbit

        lastActivityString = definitionPlaceOrbit.displayProperties.name;

      } else {

        lastActivityString = definitionActivity.displayProperties.name;

      }
    } else if (definitionActivity && definitionActivity.redacted) {
      lastActivityString = `Classified`;
    } else {
      lastActivityString = false;
    }

    const lastMode = (definitionActivityMode && definitionActivityMode.parentHashes && definitionActivityMode.parentHashes.map(hash => manifest.DestinyActivityModeDefinition[hash])) || [];

    return {
      characterId: character.characterId,
      lastPlayed: lastActivity ? lastActivity.dateActivityStarted : member.profile.profile.data.dateLastPlayed,
      lastActivity,
      lastActivityString,
      lastMode,
      matchmakingProperties: definitionActivityPlaylist?.matchmaking || definitionActivity?.matchmaking
    };

  })
}