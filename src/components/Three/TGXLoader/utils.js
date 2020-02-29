/* eslint-disable */

export const unormalize = (value, bits) => {
  var max = Math.pow(2, bits) - 1;
  return value / max;
};

export const normalize = (value, bits) => {
  var max = Math.pow(2, bits - 1) - 1;
  return Math.max(value / max, -1);
};

export const byte = (data, offset) => {
  return decodeSigned(data, offset, 1);
};

export const ubyte = (data, offset) => {
  return decodeUnsigned(data, offset, 1);
};

export const short = (data, offset) => {
  return decodeSigned(data, offset, 2);
};

export const ushort = (data, offset) => {
  return decodeUnsigned(data, offset, 2);
};

export const int = (data, offset) => {
  return decodeSigned(data, offset, 4);
};

export const uint = (data, offset) => {
  return decodeUnsigned(data, offset, 4);
};

export const float = (data, offset) => {
  return decodeFloat(bytes(data, offset, 4), 1, 8, 23, -126, 127);
};

export const bytes = (data, offset, length) => {
  var bytes = [];
  for (var i = 0; i < length; i++) {
    bytes.push(ubyte(data, offset + i));
  }
  return bytes;
};

export const string = (data, offset, length) => {
  var str = '';
  if (offset == undefined) offset = 0;
  if (length == undefined) length = data.length - offset;
  for (var i = 0; i < length; i++) {
    var chr = data[offset + i];
    if (chr == 0) continue;
    str += String.fromCharCode(chr);
  }
  //var str = data.substr(offset, length);
  //if (str.indexOf("\0") != -1) str = str.substr(0, str.indexOf("\0"));
  return str;
};

export const bits = (value, length) => {
  var str = '';
  for (var i = 0; i < length; i++) {
    str = ((value >> i) & 0x1) + str;
  }
  return str;
};

export const radianToDegrees = value => {
  return (value * 180) / Math.PI;
};

export const degreesToRadian = value => {
  return (value * Math.PI) / 180;
};

export const padNum = (num, length) => {
  num = num.toString();
  while (num.length < length) {
    num = '0' + num;
  }
  return num;
};

export const decodeHex = (data, offset, length) => {
  var hex = '';

  if (typeof data == 'number') {
    length = offset != undefined ? offset : 4;
    for (var i = 0; i < length; i++) {
      var u8 = (data >> (i * 8)) & 0xff;
      hex = padNum(u8.toString(16), 2).toUpperCase() + hex;
    }
    return '0x' + hex;
  }

  if (offset == undefined) offset = 0;
  if (length == undefined) length = data.length;
  for (var i = 0; i < length; i++) {
    hex =
      padNum(
        data
          .charCodeAt(offset + i)
          .toString(16)
          .toUpperCase(),
        2
      ) + hex;
  }
  return '0x' + hex;
};

export const decodeUnsigned = (data, offset, length) => {
  var int = 0;
  for (var i = 0; i < length; i++) {
    int |= data[offset + i] << (i * 8);
  }
  return int;
};

export const decodeSigned = (data, offset, length) => {
  if (typeof data != 'number') data = decodeUnsigned(data, offset, length);
  else length = offset;
  var bits = length * 8;
  var max = (1 << bits) - 1;
  if (data & (1 << (bits - 1))) {
    data = (data & max) - max;
  }
  return data;
};

export const decodeFloat = (bytes, signBits, exponentBits, fractionBits, eMin, eMax, littleEndian) => {
  if (littleEndian == undefined) littleEndian = true;
  var totalBits = signBits + exponentBits + fractionBits;

  var binary = '';
  for (var i = 0, l = bytes.length; i < l; i++) {
    var bits = bytes[i].toString(2);
    while (bits.length < 8) bits = '0' + bits;

    if (littleEndian) binary = bits + binary;
    else binary += bits;
  }

  var sign = binary.charAt(0) == '1' ? -1 : 1;
  var exponent = parseInt(binary.substr(signBits, exponentBits), 2) - eMax;
  var significandBase = binary.substr(signBits + exponentBits, fractionBits);
  var significandBin = '1' + significandBase;
  var i = 0;
  var val = 1;
  var significand = 0;

  if (exponent == -eMax) {
    if (significandBase.indexOf('1') == -1) return 0;
    else {
      exponent = eMin;
      significandBin = '0' + significandBase;
    }
  }

  while (i < significandBin.length) {
    significand += val * parseInt(significandBin.charAt(i));
    val = val / 2;
    i++;
  }

  return sign * significand * Math.pow(2, exponent);
};
