import { merge } from 'lodash';

import braytech_EN from '../data/manifest/en/braytech/';
import braytech_ES from '../data/manifest/es/braytech/';
import braytech_IT from '../data/manifest/it/braytech/';
import braytech_RU from '../data/manifest/ru/braytech/';
import DestinyClanBannerDefinition from '../data/manifest/en/DestinyClanBannerDefinition/';
import DestinyActivityDefinition from '../data/manifest/en/DestinyActivityDefinition/';
import DestinyHistoricalStatsDefinition from '../data/manifest/en/DestinyHistoricalStatsDefinition/';

import DestinyInventoryItemDefinition_EN from '../data/manifest/en/DestinyInventoryItemDefinition/';
import DestinyPresentationNodeDefinition_EN from '../data/manifest/en/DestinyPresentationNodeDefinition/';

const customs = {
  de: {
    braytech: braytech_EN,
  },
  en: {
    braytech: braytech_EN,
    DestinyClanBannerDefinition,
    DestinyActivityDefinition,
    DestinyHistoricalStatsDefinition,
    DestinyPresentationNodeDefinition: DestinyPresentationNodeDefinition_EN,
    DestinyInventoryItemDefinition: DestinyInventoryItemDefinition_EN
  },
  es: {
    braytech: braytech_ES,
  },
  'es-mx': {
    braytech: braytech_EN,
  },
  fr: {
    braytech: braytech_EN,
  },
  it: {
    braytech: braytech_IT,
  },
  ja: {
    braytech: braytech_EN,
  },
  ko: {
    braytech: braytech_EN,
  },
  pl: {
    braytech: braytech_EN,
  },
  'pt-br': {
    braytech: braytech_EN,
  },
  ru: {
    braytech: braytech_RU,
  },
  'zh-chs': {
    braytech: braytech_EN,
  },
  'zh-cht': {
    braytech: braytech_EN,
  }
};

const customsMerge = (bungie, customs) => {
  for (const key in customs) {
    if (customs.hasOwnProperty(key) && bungie.hasOwnProperty(key)) {
      bungie[key] = merge(bungie[key], customs[key]);
    }
  }

  return bungie;
};

const manifest = {
  set: (newManifest, lang) => {
    newManifest.BraytechDefinition = customs[lang].braytech;
    newManifest.DestinyClanBannerDefinition = customs.en.DestinyClanBannerDefinition;

    // Object.assign(newManifest.DestinyActivityDefinition, customs.en.DestinyActivityDefinition);

    customsMerge(newManifest.DestinyActivityDefinition, customs.en.DestinyActivityDefinition);
    customsMerge(newManifest.DestinyHistoricalStatsDefinition, customs.en.DestinyHistoricalStatsDefinition);
    customsMerge(newManifest.DestinyInventoryItemDefinition, customs[lang].DestinyInventoryItemDefinition);

    Object.assign(newManifest.DestinyPresentationNodeDefinition, customs.en.DestinyPresentationNodeDefinition);


    // add emotes to flair presentation node
    // if (newManifest.DestinyPresentationNodeDefinition[3066887728] && newManifest.DestinyPresentationNodeDefinition[3066887728].children && newManifest.DestinyPresentationNodeDefinition[3066887728].children.presentationNodes) {
    //   newManifest.DestinyPresentationNodeDefinition[3066887728].children.presentationNodes.push({
    //     presentationNodeHash: 'emotes'
    //   });
    // }

    // build Enigmatic Blueprint quest line
    if (newManifest.DestinyInventoryItemDefinition[2412366792]) {
      newManifest.DestinyInventoryItemDefinition['2412366792_enigmatic_blueprint'] = {
        displayProperties: {
          description: newManifest.DestinyInventoryItemDefinition[2412366792].displayProperties && newManifest.DestinyInventoryItemDefinition[2412366792].displayProperties.description,
          name: newManifest.DestinyInventoryItemDefinition[2412366792].displayProperties && newManifest.DestinyInventoryItemDefinition[2412366792].displayProperties.name,
        },
        objectives: {
          objectiveHashes: newManifest.DestinyInventoryItemDefinition[2412366792].objectives && newManifest.DestinyInventoryItemDefinition[2412366792].objectives.objectiveHashes
        },
        hash: '2412366792_enigmatic_blueprint'
      };
    }

    // override brother vance's destinationHash
    if (newManifest.DestinyVendorDefinition[2398407866].locations && newManifest.DestinyVendorDefinition[2398407866].locations.length && newManifest.DestinyVendorDefinition[2398407866].locations[0]) newManifest.DestinyVendorDefinition[2398407866].locations[0].destinationHash = 1993421442;

    // adjusted Mercury destinstion name to Fields of Glass because it's cute
    if (newManifest.DestinyDestinationDefinition[1993421442] && newManifest.DestinyDestinationDefinition[1993421442].displayProperties && newManifest.DestinyCollectibleDefinition[259147459] && newManifest.DestinyCollectibleDefinition[259147459].displayProperties && newManifest.DestinyCollectibleDefinition[259147459].displayProperties.name && newManifest.DestinyCollectibleDefinition[259147459].displayProperties.name !== '') newManifest.DestinyDestinationDefinition[1993421442].displayProperties.name = newManifest.DestinyCollectibleDefinition[259147459].displayProperties.name;

    Object.assign(manifest, newManifest);
  }
};

export default manifest;
