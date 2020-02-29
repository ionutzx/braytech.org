import fs from 'fs';
import Manifest from './manifest';

const outputPath = 'src/data/chaliceData/index.json';

const input = JSON.parse(fs.readFileSync('scripts/dump/chalice.csv.json'));

async function run() {
  const manifest = await Manifest.getManifest();

  const chalice = manifest.DestinyInventoryItemDefinition[1115550924];
  const chaliceSocketEntriesIndexes = chalice.sockets.socketCategories.find(c => c.socketCategoryHash === 3483578942).socketIndexes;
  const chaliceSlots = Object.entries(chalice.sockets.socketEntries)
    .map(([key, value]) => {
      if (chaliceSocketEntriesIndexes.includes(parseInt(key, 10))) {
        return value;
      } else {
        return false;
      }
    })
    .filter(f => f);

  let runes = {
    slot1: manifest.DestinyPlugSetDefinition[chaliceSlots[0].reusablePlugSetHash].reusablePlugItems.map(p => p.plugItemHash),
    slot2: manifest.DestinyPlugSetDefinition[chaliceSlots[1].reusablePlugSetHash].reusablePlugItems.map(p => p.plugItemHash),
    slot3: manifest.DestinyPlugSetDefinition[chaliceSlots[2].reusablePlugSetHash].reusablePlugItems.map(p => p.plugItemHash)
  };

  runes.purple = [...runes.slot1, ...runes.slot2, ...runes.slot3].filter(r => {
    let definitionPlug = manifest.DestinyInventoryItemDefinition[r];
    let identities = ['penumbra.runes.legendary.rune0', 'penumbra.runes.legendary.rune1', 'penumbra.runes.legendary.rune2'];

    if (definitionPlug && identities.includes(definitionPlug.plug.plugCategoryIdentifier)) {
      return true;
    } else {
      return false;
    }
  });
  runes.red = [...runes.slot1, ...runes.slot2, ...runes.slot3].filter(r => {
    let definitionPlug = manifest.DestinyInventoryItemDefinition[r];
    let identities = ['penumbra.runes.legendary.rune3', 'penumbra.runes.legendary.rune4', 'penumbra.runes.legendary.rune5'];

    if (definitionPlug && identities.includes(definitionPlug.plug.plugCategoryIdentifier)) {
      return true;
    } else {
      return false;
    }
  });
  runes.green = [...runes.slot1, ...runes.slot2, ...runes.slot3].filter(r => {
    let definitionPlug = manifest.DestinyInventoryItemDefinition[r];
    let identities = ['penumbra.runes.legendary.rune6', 'penumbra.runes.legendary.rune7', 'penumbra.runes.legendary.rune8'];

    if (definitionPlug && identities.includes(definitionPlug.plug.plugCategoryIdentifier)) {
      return true;
    } else {
      return false;
    }
  });
  runes.blue = [...runes.slot1, ...runes.slot2, ...runes.slot3].filter(r => {
    let definitionPlug = manifest.DestinyInventoryItemDefinition[r];
    let identities = ['penumbra.runes.legendary.rune9', 'penumbra.runes.legendary.rune10', 'penumbra.runes.legendary.rune11'];

    if (definitionPlug && identities.includes(definitionPlug.plug.plugCategoryIdentifier)) {
      return true;
    } else {
      return false;
    }
  });

  let output = [];

  let armors = {
    'Random Class Item': [919186882, 4256272077, 25091086, 874856664, 527652447, 2252973221, 3306564654, 3602032567, 1980768298, 1135872734, 1250649843, 4105225180],

    'Tangled Web Class Item': [919186882, 4256272077, 25091086],
    'Exodus Down Class Item': [874856664, 527652447, 2252973221],
    'Reverie Dawn Class Item': [3306564654, 3602032567, 1980768298],
    'Opulent Class Item': [1135872734, 1250649843, 4105225180],

    'Random Hands': [3609169817, 2502004600, 42219189, 3875829376, 1678216306, 2029766091, 2761343386, 1705856569, 2503434573, 1370039881, 3072788622, 392500791],

    'Tangled Web Hands': [3609169817, 2502004600, 42219189],
    'Exodus Down Hands': [3875829376, 1678216306, 2029766091],
    'Reverie Dawn Hands': [2761343386, 1705856569, 2503434573],
    'Opulent Hands': [1370039881, 3072788622, 392500791],

    'Random Boots': [537272242, 2206284939, 1618341271, 3545981149, 2953649850, 2079454604, 344548395, 3174233615, 188778964, 1285460104, 1661981723, 1776578009],

    'Tangled Web Boots': [537272242, 2206284939, 1618341271],
    'Exodus Down Boots': [3545981149, 2953649850, 2079454604],
    'Reverie Dawn Boots': [344548395, 3174233615, 188778964],
    'Opulent Boots': [1285460104, 1661981723, 1776578009],

    'Random Chest': [2562470699, 1034149520, 2648545535, 2218838661, 126418248, 1156448694, 2859583726, 4070309619, 1593474975, 2026757026, 2856582785, 3759327055],

    'Tangled Web Chest': [2562470699, 1034149520, 2648545535],
    'Exodus Down Chest': [2218838661, 126418248, 1156448694],
    'Reverie Dawn Chest': [2859583726, 4070309619, 1593474975],
    'Opulent Chest': [2026757026, 2856582785, 3759327055],

    'Random Helm': [2982412348, 1664085089, 4261835528, 2731698402, 2172333833, 582151075, 2824453288, 4097166900, 185695659, 831222279, 906236408, 1420117606],

    'Tangled Web Helm': [2982412348, 1664085089, 4261835528],
    'Exodus Down Helm': [2731698402, 2172333833, 582151075],
    'Reverie Dawn Helm': [2824453288, 4097166900, 185695659],
    'Opulent Helm': [831222279, 906236408, 1420117606]
  };

  let armors2 = {
    'Reverie Dawn': {
      Helmet: [99549082, 2889063206, 998096007],
      Gauntlets: [2336820707, 1903023095, 3239662350],
      'Chest Armor': [934704429, 2467635521, 2704876322],
      'Leg Armor': [4257800469, 3711557785, 1452333832],
      'Class Item': [3343583008, 3250140572, 1928769139]
    },
    Opulent: {
      Helmet: [1194507306, 308676790, 2245491369],
      Gauntlets: [1200068467, 1471193607, 36900384],
      'Chest Armor': [1908254109, 80067121, 2652946280],
      'Leg Armor': [935022405, 648456777, 3026807258],
      'Class Item': [3370242000, 2275496908, 60076357]
    },
    'Exodus Down': {
      Helmet: [1439502385, 4060742749, 3960258378],
      Gauntlets: [56157064, 2947629004, 4007396243],
      'Chest Armor': [1316205184, 472691604, 2032811197],
      'Leg Armor': [1157496418, 3593464438, 3742350309],
      'Class Item': [667921213, 1640979177, 3536375792]
    },
    'Tangled Web': {
      Helmet: [2148295091, 3061780015, 553373026],
      Gauntlets: [107232578, 880368054, 4146408011],
      'Chest Armor': [4097652774, 130772858, 2674524165],
      'Leg Armor': [2151378428, 2092750352, 1367655773],
      'Class Item': [545134223, 4074193483, 1330542168]
    }
  };

  armors2['Random Helmet'] = Object.keys(armors2).reduce((a, v) => {
    return [...a, ...armors2[v]['Helmet']]
  }, []);
  armors2['Random Gauntlets'] = Object.keys(armors2).filter(key => key.indexOf('Random') < 0).reduce((a, v) => {
    return [...a, ...armors2[v]['Gauntlets']]
  }, []);
  armors2['Random Chest Armor'] = Object.keys(armors2).filter(key => key.indexOf('Random') < 0).reduce((a, v) => {
    return [...a, ...armors2[v]['Chest Armor']]
  }, []);
  armors2['Random Leg Armor'] = Object.keys(armors2).filter(key => key.indexOf('Random') < 0).reduce((a, v) => {
    return [...a, ...armors2[v]['Leg Armor']]
  }, []);
  armors2['Random Class Item'] = Object.keys(armors2).filter(key => key.indexOf('Random') < 0).reduce((a, v) => {
    return [...a, ...armors2[v]['Class Item']]
  }, []);

  let weapons = {
    'Random SMG': [2105827099, 2681395357, 105567493, 174192097],
    'Random Sniper': [3297863558, 4190932264, 1684914716, 3100452337],
    'Random Power Weapon': [991314988, 3776129137, 3740842661, 1642384931],
    'Random Hand Cannon': [4077196130, 2429822977, 334171687, 4211534763],
    'Random Sidearm': [79075821, 3967155859, 3222518097, 1843044399],
    'Random Fusion Rifle': [3027844940, 3445437901, 4124357815, 3027844941],
    'Random Shotgun': [1327264046, 2217366863, 2919334548, 636912560]
  };

  let masterworks = {
    'Handling Masterwork': 'v400.plugs.weapons.masterworks.stat.handling',
    'Stability Masterwork': 'v400.plugs.weapons.masterworks.stat.stability',
    'Range Masterwork': 'v400.plugs.weapons.masterworks.stat.range',
    'Reload Masterwork': 'v400.plugs.weapons.masterworks.stat.reload',
    'Arc Resist': 'v400.plugs.armor.masterworks.stat.resistance_2',
    'Void Resist': 'v400.plugs.armor.masterworks.stat.resistance_4',
    'Solar Resist': 'v400.plugs.armor.masterworks.stat.resistance_3',
    Arc: 'v400.plugs.armor.masterworks.stat.resistance_2',
    Void: 'v400.plugs.armor.masterworks.stat.resistance_4',
    Solar: 'v400.plugs.armor.masterworks.stat.resistance_3'
  };

  let armorTypes = {
    Mobility: 1633794450,
    Recovery: 2032054360,
    Resilience: 3530997750
  };

  function findNode(itemHash) {
    let reverse1;
    let reverse2;
    let reverse3;

    let defItem = manifest.DestinyInventoryItemDefinition[itemHash];
    let collectibleHash = defItem.collectibleHash;

    if (defItem.itemType === 2) {
      try {
        //manifest.DestinyCollectibleDefinition[collectibleHash].presentationInfo.parentPresentationNodeHashes.forEach(element => {
        // let skip = false;
        // manifest.DestinyPresentationNodeDefinition[498211331].children.presentationNodes.forEach(parentsChild => {
        //   if (manifest.DestinyPresentationNodeDefinition[parentsChild.presentationNodeHash].children.presentationNodes.filter(el => el.presentationNodeHash === element).length > 0) {
        //     skip = true;
        //     return; // if hash is a child of badges, skip it
        //   }
        // });

        // if (reverse1 || skip) {
        //   return;
        // }
        //reverse1 = manifest.DestinyPresentationNodeDefinition[element];
        reverse1 = manifest.DestinyPresentationNodeDefinition[1605042242];
        //});
      } catch (e) {}
    } else {
      try {
        manifest.DestinyCollectibleDefinition[collectibleHash].presentationInfo.parentPresentationNodeHashes.forEach(element => {
          let skip = false;
          manifest.DestinyPresentationNodeDefinition[498211331].children.presentationNodes.forEach(parentsChild => {
            if (manifest.DestinyPresentationNodeDefinition[parentsChild.presentationNodeHash].children.presentationNodes.filter(el => el.presentationNodeHash === element).length > 0) {
              skip = true;
              return; // if hash is a child of badges, skip it
            }
          });

          if (reverse1 || skip) {
            return;
          }
          reverse1 = manifest.DestinyPresentationNodeDefinition[element];
        });

        let iteratees = reverse1.presentationInfo ? reverse1.presentationInfo.parentPresentationNodeHashes : reverse1.parentNodeHashes;
        iteratees.forEach(element => {
          if (reverse2) {
            return;
          }
          reverse2 = manifest.DestinyPresentationNodeDefinition[element];
        });

        if (reverse2 && reverse2.parentNodeHashes) {
          reverse3 = manifest.DestinyPresentationNodeDefinition[reverse2.parentNodeHashes[0]];
        }
      } catch (e) {}
    }

    return reverse1 && reverse1.hash;
  }

  input.forEach(r => {
    let t0 = [];
    let t1 = [];
    let t2 = [];
    let t3 = [];
    let t4 = false;
    let t5 = false;
    let t6 = false;
    let t7 = false;
    let t8 = false;
    let t10 = false;

    Object.values(manifest.DestinyInventoryItemDefinition).forEach(i => {
      let i1 = r.result.toLowerCase();
      let i2 = i.displayProperties ? i.displayProperties.name.toLowerCase() : 'nah';

      if (![2, 3].includes(i.itemType)) {
        return;
      }

      const testArmorSets = Object.keys(armors2).find(key => r.result.indexOf(key) > -1);

      if (testArmorSets) {
        if (/Random/i.test(r.result)) {
          t0 = armors2[testArmorSets];
          t6 = true;
        } else {
          t0 = armors2[testArmorSets][r.result.replace(testArmorSets, '').trim()];
        }

        t10 = testArmorSets;
        
        // t7 = findNode(armors2[r.result][0]);
        t8 = 2;
      } else if (weapons[r.result]) {
        t0 = weapons[r.result];
        t6 = true;
        // t7 = findNode(weapons[r.result][0]);
        t8 = 3;
      } else if (i1 === i2) {
        t0 = [i.hash];
        // t7 = findNode(i.hash);
        t8 = i.itemType;
      }

      if (masterworks[r.masterwork]) {
        t4 = masterworks[r.masterwork];
      }

      if (armors2[r.result] && armorTypes[r.armorType]) {
        t5 = armorTypes[r.armorType];
      }
    });

    let r1 = r.slot1.toLowerCase();

    if (r1 === 'any purple') {
      t1.push('braytech_purple_rune');
    } else if (r1 === 'any red') {
      t1.push('braytech_red_rune');
    } else if (r1 === 'any green') {
      t1.push('braytech_green_rune');
    } else if (r1 === 'any blue') {
      t1.push('braytech_blue_rune');
    } else {
      runes.slot1.forEach(b => {
        let def = manifest.DestinyInventoryItemDefinition[b];
        let r2 = def.displayProperties.name.toLowerCase();

        if (r1 === r2) {
          t1.push(b);
          return;
        }
      });
    }

    let r2 = r.slot2.toLowerCase();

    if (r2 === 'any purple') {
      t2.push('braytech_purple_rune');
    } else if (r2 === 'any red') {
      t2.push('braytech_red_rune');
    } else if (r2 === 'any green') {
      t2.push('braytech_green_rune');
    } else if (r2 === 'any blue') {
      t2.push('braytech_blue_rune');
    } else {
      runes.slot2.forEach(b => {
        let def = manifest.DestinyInventoryItemDefinition[b];
        let d1 = def.displayProperties.name.toLowerCase();

        if (r2 === d1) {
          t2.push(b);
          return;
        }
      });
    }

    let r3 = r.slot3.toLowerCase();

    if (r3 === 'any purple') {
      t3.push('braytech_purple_rune');
    } else if (r3 === 'any red') {
      t3.push('braytech_red_rune');
    } else if (r3 === 'any green') {
      t3.push('braytech_green_rune');
    } else if (r3 === 'any blue') {
      t3.push('braytech_blue_rune');
    } else {
      runes.slot3.forEach(b => {
        let def = manifest.DestinyInventoryItemDefinition[b];
        let d1 = def.displayProperties.name.toLowerCase();

        if (r3 === d1) {
          t3.push(b);
          return;
        }
      });
    }

    let ttt = {
      items: t0,
      combo: [t1, t2, t3],
      itemType: t8,
      csv: r
    };

    if (t4) {
      ttt.masterwork = t4;
    }

    if (t5) {
      ttt.intrinsic = t5;
    }

    if (t6) {
      ttt.random = t6;
    }

    if (t7) {
      // ttt.parentPresentationNodeHash = t7;
    }

    if (t10) {
      ttt.armorSetName = t10;
    }

    output.push(ttt);
  });

  fs.writeFileSync(outputPath, JSON.stringify(output));
}

run();
