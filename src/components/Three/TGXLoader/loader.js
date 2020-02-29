import * as THREE from 'three';

import * as utils from './utils';

export const load = async data => {

  if (!data.gear.loaded) {
    const response = await get(`https://www.bungie.net/common/destiny2_content/geometry/gear/${data.gear.filename}`);
    
    data.gear = {
      ...data.gear,
      ...response,
      loaded: true
    };
  }

  await loadContent(data);

  return data;

}

const get = async (url, type) => {
  const response = await fetch(url).then(async response => {

    /* This is where all of the TGX magic starts - these are basically ZIPs */
    if (type === 'arrayBuffer') {
      const arrayBuffer = await response.arrayBuffer();

      return new Uint8Array(arrayBuffer);
    } else if (type === 'objectURL') {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return url;
    } else {
      const json = await response.json();

      return json;
    }

  });

  return response;
}

const TGX = async url => {
  const data = await get(url, 'arrayBuffer');

  var magic = utils.string(data, 0x0, 0x4); // TGXM
  var version = utils.uint(data, 0x4);
  var fileOffset = utils.uint(data, 0x8);
  var fileCount = utils.uint(data, 0xC);
  var fileIdentifier = utils.string(data, 0x10, 0x100);
  //console.log(magic, version, fileOffset.toString(16), fileCount, fileIdentifier);
  if (magic != 'TGXM') {
    if (data.debug) console.error('Invalid TGX File', url);
    return;
  }
  var files = [];
  var fileLookup = [];
  var renderMetadata = false;
  for (var f=0; f<fileCount; f++) {
    var headerOffset = fileOffset+0x110*f;
    var name = utils.string(data, headerOffset, 0x100);
    var offset = utils.uint(data, headerOffset+0x100);
    var type = utils.uint(data, headerOffset+0x104);
    var size = utils.uint(data, headerOffset+0x108);
    var fileData = data.slice(offset, offset+size);
    //console.log('file['+f+']', headerOffset.toString(16), name, offset.toString(16), size);
    if (name.indexOf('.js') != -1) { // render_metadata.js
      fileData = JSON.parse(utils.string(fileData));
      renderMetadata = fileData;
    }
    files.push({
      name: name,
      offset: offset,
      type: type,
      size: size,
      data: fileData
    });
    fileLookup.push(name);
  }
  var tgxBin = {
    url: url,
    fileIdentifier: fileIdentifier,
    files: files,
    lookup: fileLookup,
    metadata: renderMetadata
  };
  //console.log('LoadTGXBin', url);
  
  return tgxBin;
  //contentLoaded.tgxms[url.indexOf('.bin') != -1 ? 'textures' : 'geometry'][url.slice(url.lastIndexOf('/')+1).split('.')[0]] = tgxBin;
}

const DEFAULT_CUBEMAP = '2164797681_default_monocrome_cubemap'; /*'env_0'*/;

const loadContent = async data => {

  // determine what should be loaded i.e. male or female bits

  const filteredRegionIndexSets = [];

  if (data.indexes.dye_index_set) {
    filteredRegionIndexSets.push(data.indexes.dye_index_set);
  }

  if (data.indexes.region_index_sets) { // Use gender neutral sets
    for (var setIndex in data.indexes.region_index_sets) {
      const regionIndexSet = data.indexes.region_index_sets[setIndex];
      
      for (var j=0; j<regionIndexSet.length; j++) {
        filteredRegionIndexSets.push(regionIndexSet[j]);
      }
    }
  } else if (data.indexes.female_index_set && data.indexes.male_index_set) { // Use gender-specific set (i.e. armor)
    filteredRegionIndexSets.push(data.gender === 'female' ? data.indexes.female_index_set : data.indexes.male_index_set);
  } else {
    // This is probably a shader
  }

  // Build Asset Index Table
  var geometryIndexes = [];
  var textureIndexes = [];
  var platedTextureIndexes = [];

  for (const filteredRegionIndex in filteredRegionIndexSets) {
    const filteredRegionIndexSet = filteredRegionIndexSets[filteredRegionIndex];

    var index, i;

    if (filteredRegionIndexSet == undefined) {
      if (data.debug) console.warn('MissingFilterRegionIndexSet', filteredRegionIndex, filteredRegionIndexSets);
      continue;
    }

    if (filteredRegionIndexSet.geometry) {
      for (i=0; i<filteredRegionIndexSet.geometry.length; i++) {
        geometryIndexes.push(filteredRegionIndexSet.geometry[i]);
      }
    }

    for (i=0; i<filteredRegionIndexSet.textures.length; i++) {
      textureIndexes.push(filteredRegionIndexSet.textures[i]);
    }

    if (filteredRegionIndexSet.shaders) {
      if (data.debug) console.warn('AssetHasShaders['+i+']', filteredRegionIndexSet.shaders);
    }
  }

  // Remember everything for later
  data.regions = {
    //indexSets: filteredRegionIndexSets,
    geometry: {},
    textures: {},
    platedTextures: {},
    shaders: {}
  };

  // Load Geometry
  await Promise.all(data.tgx.geometry.map(async (geometry, i) => {
    if (geometryIndexes.indexOf(i) > -1) {
      const filename = data.tgx.geometry[i].filename;
      const tgx = await TGX(`https://www.bungie.net/common/destiny2_content/geometry/platform/mobile/geometry/${filename}`);
  
      data.tgx.geometry[i] = {
        ...data.tgx.geometry[i],
        ...tgx,
        loaded: true
      }
    }
  }));   

  // Load Textures
  await Promise.all(data.tgx.textures.map(async (geometry, i) => {
    if (textureIndexes.indexOf(i) > -1) {
      const filename = data.tgx.textures[i].filename;
      const tgx = await TGX(`https://www.bungie.net/common/destiny2_content/geometry/platform/mobile/textures/${filename}`);
  
      data.tgx.textures[i] = {
        ...data.tgx.textures[i],
        ...tgx,
        reference_id: filename.split('.')[0],
        data: await createTexture(tgx),
        loaded: true
      }
    }
  }));

  //   // Load Plated Textures
  //   for (var platedTextureIndex in platedTextureIndexes) {
  //     (function(platedTextureIndex) {
  //       var platedTexture = data.plate_regions[platedTextureIndex];
  //       loadTexture(platedTexture, true, function(textureData) {
  //         contentRegions.platedTextures[platedTextureIndex] = textureData.reference_id;
  //         assetLoadCount++;
  //         checkContentLoaded();
  //       });
  //     })(platedTextureIndex);
  //   }
  // //}




  // EnvMap
  const canvas_EnvMap = document.createElement('canvas');
  canvas_EnvMap.width = 64;
  canvas_EnvMap.height = 64;
  const ctx_EnvMap = canvas_EnvMap.getContext('2d');
  ctx_EnvMap.fillStyle = '#000000';
  ctx_EnvMap.fillRect(0, 0, canvas_EnvMap.width, canvas_EnvMap.height);
  const canvas_EnvMapUrl = canvas_EnvMap.toDataURL('image/png');
  const texture_envMap = new THREE.TextureLoader().load(canvas_EnvMapUrl);

  if (data.debug) console.log(texture_envMap, data)

  // add envMap to data.textures
  data.tgx.textures.splice(0, 1, {
    name: 'defaultCubemap',
    reference_id: DEFAULT_CUBEMAP,
    filename: DEFAULT_CUBEMAP,
    data: texture_envMap,
    loaded: true
  });

  if (data.debug) console.log(`Party.`, data);

  return data;

}

const createTexture = async tgx => {

    return await Promise.all(tgx.files.map(async (texture, i) => {
    
      const data = await loadMobileTexture(texture);

      data.name = texture.name;
      data.flipY = false;
      data.minFilter = THREE.LinearFilter;
      data.magFilter = THREE.LinearFilter;
      data.wrapS = THREE.RepeatWrapping;
      data.wrapT = THREE.RepeatWrapping;
      
      // contentLoaded['textures'][texture.name] = {
      //   url: url,
      //   mobilereference_id: reference_id,
      //   reference_id: texture.name,
      //   texture: textureData
      // };

      return data;
  
    })
  );

  // if (texture.indexOf('.bin') != -1) { // Mobile texture
  //   loadTGXBin(url, function(tgxBin) {
  //     //console.log('MobileTexture', tgxBin);
  //     contentLoaded.mobileTextures[reference_id] = {
  //       url: url,
  //       reference_id: reference_id,
  //       fileIdentifier: tgxBin.fileIdentifier,
  //       texture: tgxBin.lookup
  //     };
  //     var count = 0;
  //     var total = tgxBin.files.length;
  //     for (var i=0; i<tgxBin.files.length; i++) {
  //       (function(fileIndex) {
  //         var textureFile = tgxBin.files[fileIndex];
  //         if (contentLoaded['textures'][textureFile.name] !== undefined) {
  //           //console.warn('CachedTexture', textureFile);
  //           count++;
  //           if (count == total && onLoad) onLoad(contentLoaded.mobileTextures[reference_id]);
  //           return;
  //         }
  //         var textureData = loadMobileTexture(textureFile, function() {
  //           count++;
  //           //console.log('MobileTexture['+reference_id+']', textureFile.name, textureData.image.src);
  //           if (count == total && onLoad) onLoad(contentLoaded.mobileTextures[reference_id]);
  //         });
  //         textureData.name = textureFile.name;
  //         textureData.flipY = false;
  //         textureData.minFilter = THREE.LinearFilter;
  //         textureData.magFilter = THREE.LinearFilter;
  //         textureData.wrapS = THREE.RepeatWrapping;
  //         textureData.wrapT = THREE.RepeatWrapping;
  //         contentLoaded['textures'][textureFile.name] = {
  //           url: url,
  //           mobilereference_id: reference_id,
  //           reference_id: textureFile.name,
  //           texture: textureData
  //         };
  //       })(i);
  //     }
  //   });
  // }

  // else {
  //   var contentId = isPlated ? 'platedTextures' : 'textures';
  //   if (contentLoaded[contentId][reference_id] !== undefined) {
  //     //console.warn('CachedTexture', contentId+'_'+reference_id);
  //     if (onLoad) onLoad(contentLoaded[contentId][reference_id]);
  //     return;
  //   }

  //   var loader = new THREE.TextureLoader(this.manager);
  //   var textureData = loader.load(url, function(texture) {
  //     //console.log('Texture['+reference_id+']', textureData.image.src);
  //     if (onLoad) onLoad(texture);
  //   }, onProgressCallback, onErrorCallback);
  //   textureData.name = reference_id;
  //   textureData.flipY = false;
  //   textureData.minFilter = THREE.LinearFilter;
  //   textureData.magFilter = THREE.LinearFilter;
  //   textureData.wrapS = THREE.RepeatWrapping;
  //   textureData.wrapT = THREE.RepeatWrapping;

  //   contentLoaded[contentId][reference_id] = {
  //     url: url,
  //     reference_id: reference_id,
  //     texture: textureData
  //   };
  // }
}

const loadMobileTexture = async tgx => {
  const isPng = utils.string(tgx.data, 1, 3) === 'PNG';
  const mimeType = 'image/'+(isPng ? 'png' : 'jpeg');

  const objectURL = URL.createObjectURL(new Blob([tgx.data], {type: mimeType}));

  const texture = new THREE.Texture();

  texture.image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = objectURL;
  });
  texture.needsUpdate = true;

  return texture;
}

export const loadTexture = async (url, reference_id) => {
  const texture = {}

  // if (isPlated === undefined) isPlated = false;

  // var contentId = isPlated ? 'platedTextures' : 'textures';

  const objectURL = await get(`https://www.bungie.net${url}`, 'objectURL');

  texture.data = new THREE.TextureLoader().load(objectURL);
  texture.data.flipY = false;
  texture.data.minFilter = THREE.LinearMipMapLinearFilter;
  //texture.data .magFilter = THREE.NearestFilter;
  texture.data.wrapS = THREE.RepeatWrapping;
  texture.data.wrapT = THREE.RepeatWrapping;

  texture.reference_id = reference_id;
  texture.url = url;
  texture.name = '';

  // texture.data = new THREE.Texture();
  // texture.data.flipY = false;
  // texture.data.minFilter = THREE.LinearMipMapLinearFilter;
  // //texture.data .magFilter = THREE.NearestFilter;
  // texture.data.wrapS = THREE.RepeatWrapping;
  // texture.data.wrapT = THREE.RepeatWrapping;

  // texture.reference_id = reference_id;
  // texture.url = url;
  // texture.name = '';

  // texture.image = await Promise((resolve, reject) => {
  //   const img = new Image();
  //   img.onload = () => resolve(img);
  //   img.src = objectURL;
  // });
  // texture.needsUpdate = true;

  return texture;
}