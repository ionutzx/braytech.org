import * as THREE from 'three';

import * as utils from './utils';
import TGXMaterial from './material';

let vertexOffset = 0;

export const mesh = async data => {

  vertexOffset = 0;

  const geometry = new THREE.Geometry();

  const materials = [];

  // Figure out which geometry should be loaded ie class, gender
  //var geometryHashes = [], geometryTextures = {};


  //--------

  let artContent = data.gear.art_content;
  let artContentSets = data.gear.art_content_sets;

  if (artContentSets && artContentSets.length > 1) {
    //console.log('Requires Arrangement', artContentSets);
    for (const r=0; r<artContentSets.length; r++) {
      const artContentSet = artContentSets[r];

      if (artContentSet.classHash == data.classHash) {
        artContent = artContentSet.arrangement;
        break;
      }
    }
  } else if (artContentSets && artContentSets.length > 0) {
    artContent = artContentSets[0].arrangement;
  }

  //--------

  console.log('ArtContent', artContent);

  const artRegionPatterns = [];

  if (artContent) {
    var gearSet = artContent.gear_set;
    var regions = gearSet.regions;
    if (regions.length > 0) {
      for (var u=0; u<regions.length; u++) {
        const region = regions[u];

        //if (region.pattern_list.length > 0) {
          //var pattern = region.pattern_list[0]; // Always 1?
        if (region.pattern_list.length > 1) {
          console.warn('MultiPatternRegion['+u+']', region);
          // Weapon attachments?
        }

        for (var p=0; p<region.pattern_list.length; p++) {
          var pattern = region.pattern_list[p];
          //var patternIndex = regionIndexSet[p];

          // TODO Figure out why this breaks on some models
          //var patternTextures = [];
          //for (var t=0; t<patternIndex.textures.length; t++) {
          //	var textureIndex = patternIndex.textures[t];
          //	var texture = assetIndexSet[0].textures[textureIndex];
          //	patternTextures.push(texture);
          //}

          artRegionPatterns.push({
            hash: pattern.hash,
            artRegion: u,
            patternIndex: p,
            regionIndex: region.region_index,
            geometry: pattern.geometry_hashes,
            //textures: patternTextures
          });

          //console.log('Pattern['+u+':'+p+']', pattern, patternTextures);
          //
          //for (var h=0; h<pattern.geometry_hashes.length; h++) {
          //	//geometryHashes.push(pattern.geometry_hashes[h]);
          //	parseTextures(pattern.geometry_hashes[h], patternTextures);
          //}
          break;
        }
      }
    } else {
      var overrideArtArrangement = data.gender === 'female' ? gearSet.female_override_art_arrangement : gearSet.base_art_arrangement;
      artRegionPatterns.push({
        hash: overrideArtArrangement.hash,
        artRegion: data.gender === 'female' ? 'female' : 'male',
        patternIndex: -1,
        regionIndex: -1,
        geometry: overrideArtArrangement.geometry_hashes,
        textures: [] // TODO Implement this later
      });
      //for (var o=0; o<overrideArtArrangement.geometry_hashes.length; o++) {
      //	//geometryHashes.push(overrideArtArrangement.geometry_hashes[o]);
      //	parseTextures(overrideArtArrangement.geometry_hashes[o]);
      //}
    }
  }

  //console.log('GeometryHashes', geometryHashes);
  //var geometryTextures = parseTextures(geometryHashes);
  // var geometryTextures = textures(data, artRegionPatterns);
  const geometryTextures = await parseTextures(data, artRegionPatterns);

  //var gearDyes = parseGearDyes(data.gear, shaderGear);
  //console.log('GearDyes', gearDyes);
  const gearDyes = parseGearDyes(data, null);

  // Compress geometry into a single THREE.Geometry
  //if (geometryHashes.length == 0) console.warn('NoGeometry');
  for (var a=0; a<artRegionPatterns.length; a++) {
    var artRegionPattern = artRegionPatterns[a];

    var skipRegion = false;
    switch(artRegionPattern.regionIndex) {
      case -1: // armor (no region)
      case 0: // weapon grip
      case 1: // weapon body
      //case 2: // Khvostov 7G-0X?
      case 3: // weapon scope
      case 4: // weapon stock/scope?
      case 5: // weapon magazine
      case 6: // weapon ammo (machine guns)

      case 8: // ship helm
      case 9: // ship guns
      case 10: // ship casing
      case 11: // ship engine
      case 12: // ship body
        break;

      case 21: // hud
        //skipRegion = true;
        break;

      case 22: // sparrow wings
      case 23: // sparrow body

      case 24: // ghost shell casing
      case 25: // ghost shell body
      case 26: // ghost shell cube?
        break;
      default:
          console.warn('UnknownArtRegion['+a+']', artRegionPattern.regionIndex);
        skipRegion = true;
        break;
    }
    if (skipRegion) continue;
    //if (artRegionPattern.regionIndex != 3) continue;
    //if (artRegionPattern.regionIndex != 25) continue;

    console.log('ArtRegion['+a+']', artRegionPattern);

    //if (artRegionPattern.regionIndex != 1) continue;
    //for (var g=0; g<geometryHashes.length; g++) {
    //	var geometryHash = geometryHashes[g];

    for (var g=0; g<artRegionPattern.geometry.length; g++) {
      const geometryHash = artRegionPattern.geometry[g];
      const tgxBin = data.tgx.geometry.find(t => t.fileIdentifier === geometryHash);

      console.log(data.tgx.geometry, geometryHash)

      //if (g != 0) continue;
      //if (g != 1) continue;
      if (tgxBin == undefined) {
        console.warn('MissingGeometry['+g+']', geometryHash);
        continue;
      }

      //console.log('Geometry['+g+']', geometryHash, tgxBin);

      //var renderMeshes = parseTGXAsset(tgxBin, geometryHash);

      parseGeometry(data, materials, geometry, geometryHash, geometryTextures, gearDyes);
    }
  }

  //geometry.mergeVertices();
  //geometry.computeVertexNormals();


  console.log(materials)

  //return geometry;

  return new THREE.Mesh(geometry, materials);

}

// Spasm.TGXAssetLoader.prototype.getGearRenderableModel
const parseTGXAsset = (geometryHash, tgxBin) => {

  //console.log('Metadata['+geometryHash+']', metadata);

  var meshes = [];

  //for (var renderMeshIndex in metadata.render_model.render_meshes) {
  for (var r=0; r<tgxBin.metadata.render_model.render_meshes.length; r++) {
    var renderMeshIndex = r;
    var renderMesh = tgxBin.metadata.render_model.render_meshes[renderMeshIndex]; // BoB Bunch of Bits

    //console.log('RenderMesh['+renderMeshIndex+']', renderMesh);
    //if (renderMeshIndex != 0) continue;

    // IndexBuffer
    var indexBufferInfo = renderMesh.index_buffer;
    var indexBufferData = tgxBin.files[tgxBin.lookup.indexOf(indexBufferInfo.file_name)].data;

    var indexBuffer = [];
    for (var j=0; j<indexBufferInfo.byte_size; j+=indexBufferInfo.value_byte_size) {
      var indexValue = utils.ushort(indexBufferData, j);
      indexBuffer.push(indexValue);
    }
    //console.log('IndexBuffer', indexBufferInfo);

    // VertexBuffer
    var vertexBuffer = parseVertexBuffers(tgxBin, renderMesh);

    // Spasm.RenderMesh.prototype.getRenderableParts
    //console.log('RenderMesh['+renderMeshIndex+']',
    //	"\n\tPartOffsets:", renderMesh.stage_part_offsets,
    //	"\n\tPartList:", renderMesh.stage_part_list,
    //	"\n\t", renderMesh);

    var parts = [];
    var partIndexList = [];
    var stagesToRender = [0, 7, 15]; // Hardcoded?
    var partOffsets = [];

    var partLimit = renderMesh.stage_part_offsets[4];//renderMesh.stage_part_list.length;
    //var partLimit = renderMesh.stage_part_offsets[8];//renderMesh.stage_part_list.length;
    for (var i=0; i<partLimit; i++) {
      partOffsets.push(i);
    }

    for (var i=0; i<partOffsets.length; i++) {
      var partOffset = partOffsets[i];
      var stagePart = renderMesh.stage_part_list[partOffset];

      //if (stagesToRender.indexOf(partOffset) == -1) continue;

      //console.log('StagePart['+renderMeshIndex+':'+partOffset+']',
      //	"\n\tLOD:", stagePart.lod_category,
      //	"\n\tShader:", stagePart.shader,
      //	"\n\tFlags:", stagePart.flags,
      //	"\n\tVariantShader:", stagePart.variant_shader_index
      //);
      if (!stagePart) {
        console.warn('MissingStagePart['+renderMeshIndex+':'+partOffset+']');
        continue;
      }
      if (partIndexList.indexOf(stagePart.start_index) != -1) {
        //console.warn('DuplicatePart['+renderMeshIndex+':'+partOffset, stagePart);
        continue;
      }
      partIndexList.push(stagePart.start_index);
      parts.push(parseStagePart(stagePart));
    }

    // Spasm.RenderMesh
    meshes.push({
      positionOffset: renderMesh.position_offset,
      positionScale: renderMesh.position_scale,
      texcoordOffset: renderMesh.texcoord_offset,
      texcoordScale: renderMesh.texcoord_scale,
      texcoord0ScaleOffset: renderMesh.texcoord0_scale_offset,
      indexBuffer: indexBuffer,
      vertexBuffer: vertexBuffer,
      parts: parts
    });
  }

  return meshes;
}

// Spasm.RenderMesh.prototype.getAttributes
const parseVertexBuffers = (tgxBin, renderMesh) => {
  if (renderMesh.stage_part_vertex_stream_layout_definitions.length > 1) {
    console.warn('Multiple Stage Part Vertex Layout Definitions', renderMesh.stage_part_vertex_stream_layout_definitions);
  }
  var stagePartVertexStreamLayoutDefinition = renderMesh.stage_part_vertex_stream_layout_definitions[0];
  var formats = stagePartVertexStreamLayoutDefinition.formats;

  var vertexBuffer = [];

  for (var vertexBufferIndex in renderMesh.vertex_buffers) {
    //for (var j=0; renderMesh.vertex_buffers.length; j++) {
    var vertexBufferInfo = renderMesh.vertex_buffers[vertexBufferIndex];
    var vertexBufferData = tgxBin.files[tgxBin.lookup.indexOf(vertexBufferInfo.file_name)].data;
    var format = formats[vertexBufferIndex];

    //console.log('VertexBuffer['+vertexBufferIndex+']', vertexBufferInfo.file_name, vertexBufferInfo, "\n"+'Elements', format);

    var vertexIndex = 0;
    for (var v=0; v<vertexBufferInfo.byte_size; v+= vertexBufferInfo.stride_byte_size) {
      var vertexOffset = v;
      if (vertexBuffer.length <= vertexIndex) vertexBuffer[vertexIndex] = {};
      for (var e=0; e<format.elements.length; e++) {
        var element = format.elements[e];
        var values = [];

        var elementType = element.type.replace('_vertex_format_attribute_', '');
        var types = ["ubyte", "byte", "ushort", "short", "uint", "int", "float"];
        for (var typeIndex in types) {
          var type = types[typeIndex];
          if (elementType.indexOf(type) === 0) {
            var count = parseInt(elementType.replace(type, ''));
            var j, value;
            switch(type) {
              case 'ubyte':
                for (j=0; j<count; j++) {
                  value = utils.ubyte(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.unormalize(value, 8);
                  values.push(value);
                  vertexOffset++;
                }
                break;
              case 'byte':
                for (j=0; j<count; j++) {
                  value = utils.byte(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.normalize(value, 8);
                  values.push(value);
                  vertexOffset++;
                }
                break;
              case 'ushort':
                for(j=0; j<count; j++) {
                  value = utils.ushort(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.unormalize(value, 16);
                  values.push(value);
                  vertexOffset += 2;
                }
                break;
              case 'short':
                for(j=0; j<count; j++) {
                  value = utils.short(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.normalize(value, 16);
                  values.push(value);
                  vertexOffset += 2;
                }
                break;
              case 'uint':
                for(j=0; j<count; j++) {
                  value = utils.uint(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.unormalize(value, 32);
                  values.push(value);
                  vertexOffset += 4;
                }
                break;
              case 'int':
                for(j=0; j<count; j++) {
                  value = utils.int(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.normalize(value, 32);
                  values.push(value);
                  vertexOffset += 4;
                }
                break;
              case 'float':
                // Turns out all that icky binary2float conversion stuff can be done with a typed array, who knew?
                values = new Float32Array(vertexBufferData.buffer, vertexOffset, count);
                vertexOffset += count*4;
                //console.log(values);
                //console.log(floatArray());
                //for(j=0; j<count; j++) {
                //	value = utils.float(vertexBufferData, vertexOffset);
                //	values.push(value);
                //	vertexOffset += 4;
                //}
                break;
            }
            break;
          }
        }

        var semantic = element.semantic.replace('_tfx_vb_semantic_', '');
        switch(semantic) {
          case 'position':
          case 'normal':
          case 'tangent': // Not used
          case 'texcoord':
          case 'blendweight': // Bone weights 0-1
          case 'blendindices': // Bone indices, 255=none, index starts at 1?
          case 'color':
            break;
          default:
            console.warn('Unknown Vertex Semantic', semantic, element.semantic_index, values);
            break;
        }
        vertexBuffer[vertexIndex][semantic+element.semantic_index] = values;
      }
      vertexIndex++;
    }
  }
  return vertexBuffer;
}

// Spasm.RenderablePart
const parseStagePart = (stagePart) => {
  var gearDyeSlot = 0;
  var usePrimaryColor = true;
  var useInvestmentDecal = false;

  //console.log('StagePart', stagePart);

  switch(stagePart.gear_dye_change_color_index) {
    case 0:
      gearDyeSlot = 0;
      break;
    case 1:
      gearDyeSlot = 0;
      usePrimaryColor = false;
      break;
    case 2:
      gearDyeSlot = 1;
      break;
    case 3:
      gearDyeSlot = 1;
      usePrimaryColor = false;
      break;
    case 4:
      gearDyeSlot = 2;
      break;
    case 5:
      gearDyeSlot = 2;
      usePrimaryColor = false;
      break;
    case 6:
      gearDyeSlot = 3;
      useInvestmentDecal = true;
      break;
    case 7:
      gearDyeSlot = 3;
      useInvestmentDecal = true;
      break;
    default:
      console.warn('UnknownDyeChangeColorIndex['+stagePart.gear_dye_change_color_index+']', stagePart);
      break;
  }

  var part = {
    //externalIdentifier: stagePart.external_identifier,
    //changeColorIndex: stagePart.gear_dye_change_color_index,
    //primitiveType: stagePart.primitive_type,
    //lodCategory: stagePart.lod_category,
    gearDyeSlot: gearDyeSlot,
    usePrimaryColor: usePrimaryColor,
    useInvestmentDecal: useInvestmentDecal,
    //indexMin: stagePart.index_min,
    //indexMax: stagePart.index_max,
    //indexStart: stagePart.start_index,
    //indexCount: stagePart.index_count
  };

  for (var key in stagePart) {
    var partKey = key;
    var value = stagePart[key];
    switch(key) {
      //case 'external_identifier': partKey = 'externalIdentifier'; break;
      case 'gear_dye_change_color_index': partKey = 'changeColorIndex'; break;
      //case 'primitive_type': partKey = 'primitiveType'; break;
      //case 'lod_category': partKey = 'lodCategory'; break;

      //case 'index_min': partKey = 'indexMin'; break;
      //case 'index_max': partKey = 'indexMax'; break;
      case 'start_index': partKey = 'indexStart'; break;
      //case 'index_count': partKey = 'indexCount'; break;

      case 'shader':
        var staticTextures = value.static_textures;
        value = {
          type: value.type
        };
        if (staticTextures) value.staticTextures = staticTextures;
        break;

      //case 'static_textures': partKey = 'staticTextures'; break;

      default:
        var keyWords = key.split('_');
        var partKey = '';
        for (var i=0; i<keyWords.length; i++) {
          var keyWord = keyWords[i];
          partKey += i == 0 ? keyWord : keyWord.slice(0, 1).toUpperCase()+keyWord.slice(1);
        }
        break;
    }
    part[partKey] = value;
  }

  //if (stagePart.shader) {
  //	var shader = stagePart.shader;
  //	//console.log('StagePartShader', shader);
  //	part.shader = shader.type;
  //	part.staticTextures = shader.static_textures ? shader.static_textures : [];
  //}

  return part;
}

function checkRenderPart(part) {
  var shouldRender = false;

  // Spasm was checking the lod category name for zeros which was very inefficient.
  // This implementation checks the lod category value and then further checks against
  // the part flags before filtering out geometry.
  switch(part.lodCategory.value) {
    case 0: // Main Geometry
    case 1: // Grip/Stock
    case 2: // Stickers
    case 3: // Internal/Hidden Geometry?
    //case 8: // Grip/Stock/Scope
      //if (!(part.flags & 0x30)) {
        shouldRender = true;
      //}
      break;
    case 4: // LOD 1: Low poly geometries
    case 7: // LOD 2: Low poly geometries
    case 8: // HUD / Low poly geometries
    case 9: // LOD 3: Low poly geometries
      shouldRender = false;
      break;
    default:
      console.warn('SkippedRenderMeshPart', part.lodCategory, part);
      break;
  }

  switch(part.shader ? part.shader.type : 7) {
    case -1:
      shouldRender = false;
      break;
  }

  return shouldRender;
}

function copyGearDyeParams(gearDye, materialParams) {
  for (var dyeKey in gearDye) {
    var paramKey = dyeKey;
    var dyeTexture = false;
    switch(dyeKey) {
      case 'hash':
      case 'investmentHash':
      case 'slotTypeIndex':
      case 'variant':
        paramKey = '';
        break;
      case 'diffuse': paramKey = 'detailMap'; dyeTexture = true; break;
      case 'normal': paramKey = 'detailNormalMap'; dyeTexture = true; break;
      case 'decal': paramKey = 'detailDecalMap'; dyeTexture = true; break;

      case 'primaryDiffuse': paramKey = 'primaryDetailMap'; dyeTexture = true; break;
      case 'secondaryDiffuse': paramKey = 'secondaryDetailMap'; dyeTexture = true; break;
    }
    if (paramKey) {
      materialParams[paramKey] = gearDye[dyeKey];
    }
  }
}

function parseMaterial(data, part, gearDye, geometryTextures) {
  //console.log(data, part, gearDye, geometryTextures)
  
  var materialParams = {
    //side: THREE.DoubleSide,
    //overdraw: true,
    skinning: false,
    //color: 0x777777,
    //emissive: 0x444444,
    //envMap: dyeMaterial.envMap ? dyeMaterial.envMap : null,
    //metalness: ,
    envMap: null,
    usePrimaryColor: part.usePrimaryColor
  };

  var textureLookup = [];

  // Use these for debugging
  var color = 0x333333;
  var emissive = new THREE.Color(Math.random(), Math.random(), Math.random());

  if (part.variantShaderIndex != -1) console.warn('VariantShaderPresent['+part.variantShaderIndex+']', part);

  var textures = {
    map: null,
    normalMap: null,
    gearstackMap: null,
    envMap: null
  };
  
  for (const textureId in geometryTextures) {
    textures[textureId] = geometryTextures[textureId];
  }

  if (part.shader) {
    const staticTextureIds = part.shader.staticTextures || [];

    copyGearDyeParams(gearDye, materialParams);

    if (part.flags & 0x8) {
      materialParams.useAlphaTest = true;
      console.warn('AlphaTest', part, gearDye);
    }

    if (part.flags & ~(0x8|0x10|0x5)) {
      console.warn('UnknownFlags', part.flags);
    }

    // Worldline Zero hack fix
    if (materialParams.primaryColor.r == 1 && materialParams.primaryColor.g == 0 && materialParams.primaryColor.b == 0) {
      materialParams.useDye = false;
      materialParams.useAlphaTest = false;
    }

    for (var i=0; i<staticTextureIds.length; i++) {
      const staticTextureId = staticTextureIds[i];
      console.log(staticTextureId)

      const textureLookup = data.tgx.textures.find(f => f.loaded && f.lookup?.indexOf(staticTextureId) > -1);
      const staticTextureContent = textureLookup && textureLookup.data?.find(t => t.name === staticTextureId);

      if (!staticTextureContent) {
        console.warn('MissingTexture['+staticTextureId+']');
        //continue;
      }
      var staticTexture = staticTextureContent;
      
      logTexture('staticTexture' + i + (textureLookup[i] !== undefined ? '[' + textureLookup[i] + ']' : ''), staticTexture);
    }

    var skipShader = false;

    switch(part.shader.type) {
      case 7:
        for (var textureId in textures) {
          materialParams[textureId] = textures[textureId];
        }

        if (staticTextureIds.length > 0) {
          console.warn('StaticTexturesFound', staticTextureIds);
        }

        if (part.flags & 0x10) {
          //materialParams.color = color;
          //materialParams.emissive = emissive;
          //textures.map = null;
          //textures.normalMap = null;
          //textures.gearstackMap = null;

          switch(staticTextureIds.length) {
            case 1:
              textureLookup.push('cubeMap');
              break;
            //case 2:
            //	materialParams.map = null;
            //	textures.normalMap = null;
            //	materialParams.gearstackMap = null;
            //	textureLookup.push('detailEnvMap');
            //	textureLookup.push('cubeMap');
            //	break;
            case 3:
              materialParams.map = null;
              materialParams.normalMap = null;
              materialParams.gearstackMap = null;
              textureLookup.push('map');
              textureLookup.push('map2');
              textureLookup.push('cubeMap');
              break;
          }

          for (var i=0; i<textureLookup.length; i++) {
            var textureId = textureLookup[i];

            var staticTextureId = staticTextureIds[i];
            var staticTextureContent = data.textures[staticTextureId];

            console.warn(textureId+'Texture', staticTextureContent ? staticTextureContent.reference_id : staticTextureContent);

          }

          //var staticTextureId = staticTextureIds[staticTextureIds.length-1];
          //var staticTextureContent = contentLoaded.textures[staticTextureId];
          //
          //console.warn('CubeMapTexture', staticTextureContent ? staticTextureContent.reference_id : staticTextureContent);
          //textureLookup.push('cubeMap');
        }
        break;
      //case 8:
      //	for (var textureId in textures) {
      //		materialParams[textureId] = textures[textureId];
      //	}
      //	break;
      default:
        console.warn('UnknownShader', part.shader, part, gearDye);
        skipShader = true;
        break;
    }

    if (!skipShader) {
      for (var i=0; i<textureLookup.length; i++) {
        var textureId = textureLookup[i];
        var staticTextureId = staticTextureIds[i];
        var staticTextureContent = data.textures[staticTextureId];

        console.log(`!skipShader`, textureId, staticTextureId)

        //const textureLookup = data.tgx.textures.find(f => f.loaded && f.lookup?.indexOf(staticTextureId) > -1);
        //const staticTextureContent = textureLookup && textureLookup.data?.find(t => t.name === staticTextureId);
        
        if (!staticTextureContent) {
          console.warn('MissingTexture['+staticTextureId+']');
          //continue;
        }

        console.log(staticTextureContent)

        var staticTexture = staticTextureContent ? staticTextureContent.texture : null;

        switch(textureId) {
          case 'alphaMap':
            materialParams.transparent = true;
            break;
          case 'cubeMap':
            staticTexture = loadCubeTexture(staticTexture);
            textureId = 'envMap';
            break;
          default:
        }
        
        materialParams[textureId] = staticTexture;
      }

      console.log('MaterialParams', materialParams);

      return new TGXMaterial(materialParams);
    }
  } else {
    console.warn('NoShader', part);
  }

  return false;
}

function loadCubeTexture(data, texture) {
  var textureId = (texture ? texture.name : 'null')+'__';
  if (data.textures[textureId] !== undefined) {
    return data.textures[textureId].texture;
  }

  var loader = new THREE.CubeTextureLoader();

  var cubeWidth = 256;
  var cubeHeight = 256;

  var canvas = document.createElement('canvas');
  if (texture) {
    cubeWidth = texture.image.width/4;
    cubeHeight = texture.image.height/3;
  }
  var cubeSize = Math.floor(cubeWidth/4)*4;
  canvas.width = cubeSize;
  canvas.height = cubeSize;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, cubeSize, cubeSize);
  //ctx.drawImage(texture.image, 0, 0);
  var offsets = [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [0, 2]
  ];
  var images = [];
  for (var i=0; i<offsets.length; i++) {
    var offset = offsets[i];
    if (texture) {
      ctx.drawImage(texture.image, offset[0]*cubeWidth, offset[1]*cubeHeight, cubeWidth, cubeHeight, 0, 0, cubeSize, cubeSize);
    }
    var cubeFace = canvas.toDataURL('image/png');
    //logImageSrc(cubeFace);
    images.push(cubeFace);
  }

  var cubeTexture = loader.load(images);
  cubeTexture.name = textureId;
  data.textures[textureId] = {
    reference_id: textureId,
    texture: cubeTexture
  };

  return cubeTexture;
}

function logTexture(textureId, texture) {
  var src = null;
  var logName = '';
  if (texture) {
    src = texture.image ? texture.image.src : texture.src;
    logName = texture.name+(src && src.indexOf('blob') != -1 ? ' '+src : '');
  }

  console.log("\t"+textureId+': '+logName);

  if (src && src.indexOf('blob') != -1) {
    var canvas = document.createElement('canvas');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);
    src = canvas.toDataURL('image/png');
  }

  if (src) logImageSrc(src);
}

function logImageSrc(src) {
  console.log("\t\t"+'%c  ', 'font-size: 50px; background: url("'+src+'") center no-repeat; background-size: contain; border: 1px solid;');
}

const parseGeometry = (data, materials, geometry, geometryHash, geometryTextures, gearDyes) => {
  const tgxBin = data.tgx.geometry.find(t => t.fileIdentifier === geometryHash);
  const renderMeshes = parseTGXAsset(geometryHash, tgxBin);

  const gearDyeSlotOffsets = [];

  for (let i=0; i<gearDyes.length; i++) {
    const gearDye = gearDyes[i];

    gearDyeSlotOffsets.push(materials.length);

    // Create a material for both primary and secondary color variants
    for (let j=0; j<2; j++) {
      const materialParams = {
        skinning: false,
        usePrimaryColor: j == 0,
        envMap: null
      };

      for (const textureId in geometryTextures[geometryHash]) {
        const texture = geometryTextures[geometryHash][textureId];
        
        materialParams[textureId] = texture;
      }

      copyGearDyeParams(gearDye, materialParams);

      const material = new TGXMaterial(materialParams);
      material.name = geometryHash + '-' + (j == 0 ? 'Primary' : 'Secondary') + i;
      
      materials.push(material);
    }
  }

  for (var m=0; m<renderMeshes.length; m++) {
    var renderMesh = renderMeshes[m];
    var indexBuffer = renderMesh.indexBuffer;
    var vertexBuffer = renderMesh.vertexBuffer;
    var positionOffset = renderMesh.positionOffset;
    var positionScale = renderMesh.positionScale;
    var texcoord0ScaleOffset = renderMesh.texcoord0ScaleOffset;
    var texcoordOffset = renderMesh.texcoordOffset;
    var texcoordScale = renderMesh.texcoordScale;
    var parts = renderMesh.parts;

    if (parts.length == 0) {
      console.log('Skipped RenderMesh['+geometryHash+':'+m+']: No parts');
      continue;
    }

    // Spasm.Renderable.prototype.render
    let partCount = -1;

    for (let p=0; p<parts.length; p++) {
      const part = parts[p];

      if (!checkRenderPart(part)) continue;

      // Ghost Shell Eye Bg
      //if (m != 0) continue;
      //if (p != 3) continue;

      //if (m != 0) continue;
      //if (p <6) continue;

      // Phoenix Strife Type 0 - Feathers
      //if (m != 1 && p != 1) continue;

      console.log('RenderMeshPart[' + geometryHash + ':' + m + ':' + p + ']', part);
      
      partCount++;

      if (gearDyeSlotOffsets[part.gearDyeSlot] == undefined) {
        console.warn('MissingDefaultDyeSlot', part.gearDyeSlot);

        part.gearDyeSlot = 0;
      }

      let materialIndex = gearDyeSlotOffsets[part.gearDyeSlot]+(part.usePrimaryColor ? 0 : 1);

      //console.log('RenderMeshPart['+geometryHash+':'+m+':'+p+']', part);

      // Load Material
      //if (loadTextures) {
      const textures = geometryTextures[geometryHash];
      
      if (!textures) {
        //console.warn('NoGeometryTextures['+geometryHash+']', part);
      } else {
        //continue;
      }

      const material = parseMaterial(data, part, gearDyes[part.gearDyeSlot], textures);

      if (material) {
        material.name = geometryHash+'-CustomShader'+m+'-'+p;
        materials.push(material);
        materialIndex = materials.length-1;
        //console.log('MaterialName['+materialIndex+']:'+material.name);
      }

      // Load Vertex Stream
      let increment = 3;
      let start = part.indexStart;
      let count = part.indexCount;

      // PrimitiveType, 3=TRIANGLES, 5=TRIANGLE_STRIP
      // https://stackoverflow.com/questions/3485034/convert-triangle-strips-to-triangles

      if (part.primitiveType === 5) {
        increment = 1;
        count -= 2;
      }

      for (let i=0; i<count; i+= increment) {
        const faceVertexNormals = [];
        const faceVertexUvs = [];
        const faceVertex = [];

        const faceColors = [];

        const detailVertexUvs = [];

        const faceIndex = start+i;

        const tri = part.primitiveType === 3 || i & 1 ? [0, 1, 2] : [2, 1, 0];

        for (let j=0; j<3; j++) {
          const index = indexBuffer[faceIndex+tri[j]];
          const vertex = vertexBuffer[index];
          if (!vertex) { // Verona Mesh
            console.warn('MissingVertex['+index+']');
            i=count;
            break;
          }

          const normal = vertex.normal0;
          const uv = vertex.texcoord0;
          const color = vertex.color0;

          let detailUv = vertex.texcoord2;
          if (!detailUv) detailUv = [0, 0];

          faceVertex.push(index+vertexOffset);
          faceVertexNormals.push(new THREE.Vector3(-normal[0], -normal[1], -normal[2]));

          const uvu = uv[0]*texcoordScale[0]+texcoordOffset[0];
          const uvv = uv[1]*texcoordScale[1]+texcoordOffset[1];
          faceVertexUvs.push(new THREE.Vector2(uvu, uvv));

          if (color) {
            //console.log('Color['+m+':'+p+':'+i+':'+j+']', color);
            faceColors.push(new THREE.Color(color[0], color[1], color[2]));
          }

          detailVertexUvs.push(new THREE.Vector2(
            uvu*detailUv[0],
            uvv*detailUv[1]
          ));
        }

        const face = new THREE.Face3(faceVertex[0], faceVertex[1], faceVertex[2], faceVertexNormals);

        face.materialIndex = materialIndex;

        if (faceColors.length > 0) face.vertexColors = faceColors;

        geometry.faces.push(face);
        geometry.faceVertexUvs[0].push(faceVertexUvs);

        if (geometry.faceVertexUvs.length < 2) geometry.faceVertexUvs.push([]);
      }
    }

    for (let v=0; v<vertexBuffer.length; v++) {
      var vertex = vertexBuffer[v];
      var position = vertex.position0;
      var x = position[0];
      var y = position[1];
      var z = position[2];

      geometry.vertices.push(new THREE.Vector3(x, y, z));

      // Set bone weights
      var boneIndex = position[3];
      //var bone = geometry.bones[boneIndex];

      var blendIndices = vertex.blendindices0 ? vertex.blendindices0 : [boneIndex, 255, 255, 255];
      var blendWeights = vertex.blendweight0 ? vertex.blendweight0: [1, 0, 0, 0];

      var skinIndex = [0, 0, 0, 0];
      var skinWeight = [0, 0, 0, 0];

      var totalWeights = 0;

      for (var w=0; w<blendIndices.length; w++) {
        if (blendIndices[w] == 255) break;
        skinIndex[w] = blendIndices[w];
        skinWeight[w] = blendWeights[w];
        totalWeights += blendWeights[w]*255;
      }

      if (totalWeights != 255) console.error('MissingBoneWeight', 255-totalWeights);

      geometry.skinIndices.push(new THREE.Vector4().fromArray(skinIndex));
      geometry.skinWeights.push(new THREE.Vector4().fromArray(skinWeight));
      //geometry.skinIndices[index+vertexOffset].fromArray(skinIndex);
      //geometry.skinWeights[index+vertexOffset].fromArray(skinWeight);
    }

    vertexOffset += vertexBuffer.length;
  }
}

const parseTextures = async (data, artRegionPatterns) => {
  let canvas, ctx;
  const canvasPlates = {};
  const geometryTextures = [];

  //for (var g=0; g<geometryHashes.length; g++) {
  //var geometryHash = geometryHashes[g];
  for (var a = 0; a < artRegionPatterns.length; a++) {
    var artRegionPattern = artRegionPatterns[a];

    for (var g = 0; g < artRegionPattern.geometry.length; g++) {
      const geometryHash = artRegionPattern.geometry[g];

      console.log(geometryHash);

      const tgxBin = data.tgx.geometry.find(f => f.fileIdentifier === geometryHash);

      if (!tgxBin) {
        console.warn('MissingTGXBinGeometry[' + g + ']', geometryHash);
        continue;
      }

      var metadata = tgxBin.metadata;
      var texturePlates = metadata.texture_plates;

      //console.log('Metadata['+geometryHash+']', tgxBin);

      // Spasm.TGXAssetLoader.prototype.getGearRenderableModel
      //console.log('TexturePlates['+g+']', texturePlates);
      if (texturePlates.length == 1) {
        var texturePlate = texturePlates[0];
        var texturePlateSet = texturePlate.plate_set;

        // Stitch together plate sets
        // Web versions are pre-stitched

        for (var texturePlateId in texturePlateSet) {
          var texturePlate = texturePlateSet[texturePlateId];
          var texturePlateRef = texturePlateId + '_' + texturePlate.plate_index;
          //var texturePlateRef = geometryHash+'_'+texturePlateId+'_'+texturePlate.plate_index;

          var textureId = texturePlateId;
          switch (texturePlateId) {
            case 'diffuse':
              textureId = 'map';
              break;
            case 'normal':
              textureId = 'normalMap';
              break;
            case 'gearstack':
              textureId = 'gearstackMap';
              break;
            default:
              console.warn('UnknownTexturePlateId', texturePlateId, texturePlateSet);
              break;
          }

          if (texturePlate.texture_placements.length == 0) {
            //console.warn('SkippedEmptyTexturePlate['+texturePlateId+'_'+texturePlate.plate_index+']');
            //continue;
          }

          var canvasPlate = canvasPlates[texturePlateRef];
          if (!canvasPlate) {
            //console.log('NewTexturePlacementCanvas['+texturePlateRef+']');
            canvas = document.createElement('canvas');
            canvas.width = texturePlate.plate_size[0];
            canvas.height = texturePlate.plate_size[1];
            ctx = canvas.getContext('2d');

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FFFFFF';
            canvasPlate = {
              plateId: texturePlateId,
              textureId: textureId,
              canvas: canvas,
              hashes: []
            };
            canvasPlates[texturePlateRef] = canvasPlate;
          }
          canvas = canvasPlate.canvas;
          ctx = canvas.getContext('2d');
          if (canvasPlate.hashes.indexOf(geometryHash) == -1) canvasPlate.hashes.push(geometryHash);

          for (var p = 0; p < texturePlate.texture_placements.length; p++) {
            const placement = texturePlate.texture_placements[p];
            // console.log(texturePlate)

            // var placementTexture = data.textures[placement.texture_tag_name];
            const textureLookup = data.tgx.textures.find(f => f.loaded && f.lookup?.indexOf(placement.texture_tag_name) > -1);
            const placementTexture = textureLookup && textureLookup.data?.find(t => t.name === placement.texture_tag_name);

            // console.log(placementTexture)

            const scale = 1;

            // Fill draw area with white in case there are textures with an alpha channel
            //ctx.fillRect(placement.position_x*scale, placement.position_y*scale, placement.texture_size_x*scale, placement.texture_size_y*scale);
            // Actually it looks like the alpha channel is being used for masking
            ctx.clearRect(placement.position_x * scale, placement.position_y * scale, placement.texture_size_x * scale, placement.texture_size_y * scale);

            if (!placementTexture) {
              console.warn('MissingPlacementTexture', placement.texture_tag_name, data.textures);
              continue;
            }
            if (!placementTexture.image) {
              console.warn('TextureNotLoaded', placementTexture);
              continue;
            }
            // console.log(placementTexture, placementTexture.image)

            ctx.drawImage(placementTexture.image, placement.position_x, placement.position_y, placement.texture_size_x, placement.texture_size_y);
          }
        }
      } else if (texturePlates.length > 1) {
        console.warn('MultipleTexturePlates?', texturePlates);
      }
    }
  }

  for (var canvasPlateId in canvasPlates) {
    const canvasPlate = canvasPlates[canvasPlateId];
    const dataUrl = canvasPlate.canvas.toDataURL('image/png');

    console.log(canvasPlate, canvasPlates);
    logImageSrc(dataUrl);

    const platedTexture = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = dataUrl;
    });

    data.tgx.platedTextures[canvasPlateId] = {
      texture: platedTexture
    }

    for (var i = 0; i < canvasPlate.hashes.length; i++) {
      var geometryHash = canvasPlate.hashes[i];

      if (geometryTextures[geometryHash] == undefined) {
        geometryTextures[geometryHash] = {};
      }
      
      console.log(geometryTextures)

      //if (geometryTextures[geometryHash][canvasPlate.plateId] != undefined) {
      if (geometryTextures[geometryHash][canvasPlate.textureId] != undefined) {
        //console.warn('OverridingTexturePlate['+geometryHash+':'+canvasPlate.plateId+']', geometryTextures[geometryHash][canvasPlate.plateId]);
        console.warn('OverridingTexturePlate[' + geometryHash + ':' + canvasPlate.textureId + ']', geometryTextures[geometryHash][canvasPlate.textureId]);
        continue;
      }

      //geometryTextures[geometryHash][canvasPlate.plateId] = texture;


      // fuck ay

      const texture = new THREE.Texture();
      texture.flipY = false;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      //texture.data .magFilter = THREE.NearestFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    
      texture.image = data.tgx.platedTextures[canvasPlateId].texture;
      texture.needsUpdate = true;

      geometryTextures[geometryHash][canvasPlate.textureId] = texture;
    }
  }

  return geometryTextures;
}

// Spasm.TGXAssetLoader.prototype.getGearDyes
function getGearDyes(data) {
  var dyeGroups = {
    customDyes: data.gear.custom_dyes || [],
    defaultDyes: data.gear.default_dyes || [],
    lockedDyes: data.gear.locked_dyes || []
  };

  var gearDyeGroups = {};

  for (var dyeType in dyeGroups) {
    var dyes = dyeGroups[dyeType];
    var gearDyes = [];
    for (var i=0; i<dyes.length; i++) {
      var dye = dyes[i];
      var dyeTextures = dye.textures;
      var materialProperties = dye.material_properties;
      console.log('GearDye['+dyeType+']['+i+']', dye);

      var gearDyeTextures = {};

      for (var dyeTextureId in dyeTextures) {
        const dyeTexture = dyeTextures[dyeTextureId];
        //console.log('DyeTexture['+dyeTextureId+']', dyeTexture);

        const texture = data.tgx.textures.find(t => t.reference_id === dyeTexture.reference_id);
        if (texture) {
          gearDyeTextures[dyeTextureId] = texture;
        }
        // else if (dyeTexture.name && contentLoaded.textures[dyeTexture.name] !== undefined) {
        //   gearDyeTextures[dyeTextureId] = contentLoaded.textures[dyeTexture.name];
        // }
      }

      //console.log('DyeTextures', gearDyeTextures);

      // Spasm.GearDye
      var gearDye = {
        //identifier: dye.identifier, // Doesn't exist?
        hash: dye.hash,
        investmentHash: dye.investment_hash,
        slotTypeIndex: dye.slot_type_index,

        diffuse: gearDyeTextures.diffuse ? gearDyeTextures.diffuse.texture : null,
        normal: gearDyeTextures.normal ? gearDyeTextures.normal.texture : null,
        decal: gearDyeTextures.decal ? gearDyeTextures.decal.texture : null,

        // Not used?
        //primaryColor: 0x000000,
        primaryDiffuse: gearDyeTextures.primary_diffuse ? gearDyeTextures.primary_diffuse.texture : null,
        //secondaryColor: 0x000000,
        secondaryDiffuse: gearDyeTextures.secondary_diffuse ? gearDyeTextures.secondary_diffuse.texture : null,

        isCloth: dye.cloth
      };

      var dyeMat = dye.material_properties;

      gearDye.primaryColor = new THREE.Color().fromArray(dyeMat.primary_albedo_tint);
      // primary_material_params
      gearDye.secondaryColor = new THREE.Color().fromArray(dyeMat.secondary_albedo_tint);
      // secondary_material_params
      gearDye.wornColor = new THREE.Color().fromArray(dyeMat.worn_albedo_tint);
      // worn_material_parameters

      var spec = dyeMat.specular_properties;
      console.log('MatSpecularParams', dyeMat.specular_properties);
      //gearDye.specular = new THREE.Color(spec[0], spec[0], spec[0]);
      //gearDye.shininess = spec[1];
      //gearDye.specular = new THREE.Color(0xffffff);
      //gearDye.shininess = 32;

      gearDye.detailDiffuseTransform = dyeMat.detail_diffuse_transform;
      gearDye.detailNormalTransform = dyeMat.detail_normal_transform;

      // Physically Based Rendering
      // emissive_pbr_params
      // emissive_tint_color_and_intensity_bias
      // lobe_pbr_params
      // tint_pbr_params

      //gearDye.metalness = 1;//dyeMat.tint_pbr_params[0];

      //if (i == 0) gearDye.metalness = 0;

      // spec_aa_xform

      gearDye.primaryParams = dyeMat.primary_material_params;
      //gearDye.primaryParamsAdvanced = dyeMat.primary_material_advanced_params;
      gearDye.secondaryParams = dyeMat.secondary_material_params;
      gearDye.wornParams = dyeMat.worn_material_parameters;

      //if (dyeMat.primary_material_advanced_params[0] == -1) {
      //	gearDye.useDye = false;
      //}


      console.warn('PrimaryMatParams', dyeMat.primary_material_params, dyeMat.primary_material_advanced_params);
      console.warn('SecondaryMatParams', dyeMat.secondary_material_params);
      console.warn('WornMatParams', dyeMat.worn_material_parameters);

      logColors([gearDye.primaryColor, gearDye.secondaryColor, gearDye.wornColor]);

      //console.log(gearDye);
      gearDyes.push(gearDye);
    }
    gearDyeGroups[dyeType] = gearDyes;
  }
  return gearDyeGroups;
}

function logColors(colors) {
  var format = [];
  var args = [];
  for (var i=0; i<colors.length; i++) {
    var color = colors[i];
    if (!color) continue;
    color = new THREE.Color(color);
    format.push("%c #"+color.getHexString());
    args.push("border-left: 14px solid #"+color.getHexString()+';');
  }
  console.log.apply(null, [format.join(' ')].concat(args));
}

function parseGearDyes(data, shaderGear) {

  var gearDyeGroups = getGearDyes(data);
  var shaderDyeGroups = shaderGear ? getGearDyes(shaderGear) : gearDyeGroups;

  console.log('GearDyes', gearDyeGroups);
  //console.log('ShaderGearDyes', shaderDyeGroups);

  // Spasm.GearRenderable.prototype.getResolvedDyeList
  var resolvedDyes = [];
  var dyeTypeOrder = ['defaultDyes', 'customDyes', 'lockedDyes'];
  for (var i=0; i<dyeTypeOrder.length; i++) {
    var dyeType = dyeTypeOrder[i];
    var dyes = [];
    switch(dyeType) {
      case 'defaultDyes':
        dyes = gearDyeGroups[dyeType];
        break;
      case 'customDyes':
        dyes = shaderDyeGroups[dyeType];
        break;
      case 'lockedDyes':
        dyes = gearDyeGroups[dyeType];
        break;
    }
    for (var j=0; j<dyes.length; j++) {
      var dye = dyes[j];
      //console.log('DyeSlotIndex', j, dye.slotTypeIndex, dye);
      //if (dyeType == 'lockedDyes' && ignoreLockedDyes && resolvedDyes[dye.slotTypeIndex]) continue;
      resolvedDyes[dye.slotTypeIndex] = dye;
      //resolvedDyes[j] = dye;
    }
  }

  console.log('ResolvedGearDyes', resolvedDyes);

  return resolvedDyes;
}