import React from 'react';
import cx from 'classnames';
import { isEqual } from 'lodash';

import manifest from '../../../utils/manifest';
import Spinner from '../../UI/Spinner';

import './styles.css';

function loadImage(url) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = e => {
      resolve(image);
    };
    image.onerror = async e => {
      resolve(loadImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII='));
    }
    image.src = url;
  });
}

class ClanBanner extends React.Component {
  state = {
    loading: true
  };

  bannerConfig = {
    DecalBgImage: {
      src: false,
      color: false,
      el: false
    },
    DecalFgImage: {
      src: false,
      color: false,
      el: false
    },
    GonfalonImage: {
      src: false,
      color: false,
      el: false
    },
    GonfalonDetailImage: {
      src: false,
      color: false,
      el: false
    },
    StandImage: {
      src: '/img/bannercreator/FlagStand00.png',
      el: false
    },
    FlagOverlay: {
      src: '/img/bannercreator/flag_overlay.png',
      el: false
    }
  };

  buildBannerConfig = (clanBannerData = this.props.bannerData) => {
    const decals = manifest.DestinyClanBannerDefinition.Decals.find(decal => decal.imageHash === clanBannerData.decalId);
    const decalPrimaryColor = manifest.DestinyClanBannerDefinition.DecalPrimaryColors.find(color => color.colorHash === clanBannerData.decalColorId);
    const decalSecondaryColor = manifest.DestinyClanBannerDefinition.DecalSecondaryColors.find(color => color.colorHash === clanBannerData.decalBackgroundColorId);

    const gonfalon = manifest.DestinyClanBannerDefinition.Gonfalons.find(gonfalon => gonfalon.imageHash === clanBannerData.gonfalonId);
    const gonfalonColor = manifest.DestinyClanBannerDefinition.GonfalonColors.find(color => color.colorHash === clanBannerData.gonfalonColorId);

    const gonfalonDetail = manifest.DestinyClanBannerDefinition.GonfalonDetails.find(gonfalon => gonfalon.imageHash === clanBannerData.gonfalonDetailId);
    const gonfalonDetailColor = manifest.DestinyClanBannerDefinition.GonfalonDetailColors.find(color => color.colorHash === clanBannerData.gonfalonDetailColorId);
    
    this.bannerConfig.DecalFgImage.src = decals.foregroundImagePath;
    this.bannerConfig.DecalFgImage.color = `${decalPrimaryColor.red}, ${decalPrimaryColor.green}, ${decalPrimaryColor.blue}, ${Math.min(decalPrimaryColor.alpha, 1)}`;
    this.bannerConfig.DecalBgImage.src = decals.backgroundImagePath;
    this.bannerConfig.DecalBgImage.color = `${decalSecondaryColor.red}, ${decalSecondaryColor.green}, ${decalSecondaryColor.blue}, ${Math.min(decalSecondaryColor.alpha, 1)}`;
    this.bannerConfig.GonfalonImage.src = gonfalon.foregroundImagePath;
    this.bannerConfig.GonfalonImage.color = `${gonfalonColor.red}, ${gonfalonColor.green}, ${gonfalonColor.blue}, ${Math.min(gonfalonColor.alpha, 1)}`;
    this.bannerConfig.GonfalonDetailImage.src = gonfalonDetail.foregroundImagePath;
    this.bannerConfig.GonfalonDetailImage.color = `${gonfalonDetailColor.red}, ${gonfalonDetailColor.green}, ${gonfalonDetailColor.blue}, ${Math.min(gonfalonDetailColor.alpha, 1)}`;

    this.doLoad();
  };

  componentDidMount() {
    this.mounted = true;

    this.buildBannerConfig();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  doLoad = async () => {
    this.setState({ loading: true });

    const images = await Promise.all(
      Object.keys(this.bannerConfig).map(async key => {

        const src = key === 'StandImage' ? '/static/images/extracts/flair/FlagStand01.png' : 'https://www.bungie.net' + this.bannerConfig[key].src;
        
        return {
          key,
          el: await loadImage(src)
        };
      })
    );

    images.forEach(({ key, el }) => {
      this.bannerConfig[key].el = el;
    });
    
    this.setState({ loading: false });
  }

  componentDidUpdate(p, s) {
    if (!isEqual(p.bannerData, this.props.bannerData)) {
      this.buildBannerConfig(this.props.bannerData);
    }
  }

  render() {
    const canvasWidth = 410;
    const canvasHeight = 700;

    if (!this.state.loading) {
      const canvasFinal = this.refs.canvas;
      const ctxFinal = canvasFinal.getContext('2d');

      const canvasGonfalon = document.createElement('canvas');
      canvasGonfalon.height = canvasHeight;
      canvasGonfalon.width = canvasWidth;
      const ctxGonfalon = canvasGonfalon.getContext('2d');

      const canvasGonfalonDetail = document.createElement('canvas');
      canvasGonfalonDetail.height = canvasHeight;
      canvasGonfalonDetail.width = canvasWidth;
      const ctxGonfalonDetail = canvasGonfalonDetail.getContext('2d');

      const canvasDecalBg = document.createElement('canvas');
      canvasDecalBg.height = canvasHeight;
      canvasDecalBg.width = canvasWidth;
      const ctxDecalBg = canvasDecalBg.getContext('2d');

      const canvasDecalFg = document.createElement('canvas');
      canvasDecalFg.height = canvasHeight;
      canvasDecalFg.width = canvasWidth;
      const ctxDecalFg = canvasDecalFg.getContext('2d');

      const canvasCombined = document.createElement('canvas');
      canvasCombined.height = canvasHeight;
      canvasCombined.width = canvasWidth;
      const ctxCombined = canvasCombined.getContext('2d');

      const canvasMasked = document.createElement('canvas');
      canvasMasked.height = canvasHeight;
      canvasMasked.width = canvasWidth;
      const ctxMasked = canvasMasked.getContext('2d');

      ctxFinal.clearRect(0, 0, canvasWidth, canvasHeight);

      ctxGonfalon.drawImage(this.bannerConfig.GonfalonImage.el, canvasWidth / 2 - this.bannerConfig.GonfalonImage.el.naturalWidth / 2, 21, this.bannerConfig.GonfalonImage.el.naturalWidth, this.bannerConfig.GonfalonImage.el.naturalHeight);
      ctxGonfalon.globalCompositeOperation = 'source-in';
      ctxGonfalon.fillStyle = 'rgba(' + this.bannerConfig.GonfalonImage.color + ')';
      ctxGonfalon.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxGonfalonDetail.drawImage(this.bannerConfig.GonfalonDetailImage.el, canvasWidth / 2 - this.bannerConfig.GonfalonDetailImage.el.naturalWidth / 2, 21, this.bannerConfig.GonfalonDetailImage.el.naturalWidth, this.bannerConfig.GonfalonDetailImage.el.naturalHeight);
      ctxGonfalonDetail.globalCompositeOperation = 'source-in';
      ctxGonfalonDetail.fillStyle = 'rgba(' + this.bannerConfig.GonfalonDetailImage.color + ')';
      ctxGonfalonDetail.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxDecalBg.drawImage(this.bannerConfig.DecalBgImage.el, canvasWidth / 2 - this.bannerConfig.DecalBgImage.el.naturalWidth / 2, 21, this.bannerConfig.DecalBgImage.el.naturalWidth, this.bannerConfig.DecalBgImage.el.naturalHeight);
      ctxDecalBg.globalCompositeOperation = 'source-in';
      ctxDecalBg.fillStyle = 'rgba(' + this.bannerConfig.DecalBgImage.color + ')';
      ctxDecalBg.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxDecalFg.drawImage(this.bannerConfig.DecalFgImage.el, canvasWidth / 2 - this.bannerConfig.DecalFgImage.el.naturalWidth / 2, 21, this.bannerConfig.DecalFgImage.el.naturalWidth, this.bannerConfig.DecalFgImage.el.naturalHeight);
      ctxDecalFg.globalCompositeOperation = 'source-in';
      ctxDecalFg.fillStyle = 'rgba(' + this.bannerConfig.DecalFgImage.color + ')';
      ctxDecalFg.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxCombined.drawImage(canvasGonfalon, 0, 0, canvasWidth, canvasHeight);
      ctxCombined.globalCompositeOperation = 'source-atop';
      ctxCombined.drawImage(canvasGonfalonDetail, 0, 0, canvasWidth, canvasHeight);
      ctxCombined.drawImage(canvasDecalBg, 0, 0, canvasWidth, canvasHeight);
      ctxCombined.drawImage(canvasDecalFg, 0, 0, canvasWidth, canvasHeight);

      ctxMasked.drawImage(canvasCombined, 0, 0, canvasWidth, canvasHeight);

      ctxMasked.globalCompositeOperation = 'source-atop';
      ctxMasked.drawImage(this.bannerConfig.FlagOverlay.el, canvasWidth / 2 - this.bannerConfig.FlagOverlay.el.naturalWidth / 2, 21, this.bannerConfig.FlagOverlay.el.naturalWidth, this.bannerConfig.FlagOverlay.el.naturalHeight);

      ctxFinal.drawImage(canvasMasked, 0, 0, canvasWidth, canvasHeight);
      // ctxFinal.drawImage(this.bannerConfig.StandImage.el, canvasWidth / 2 - this.bannerConfig.GonfalonImage.el.naturalWidth / 2 - 10, 6, canvasWidth * 0.85, canvasHeight * 0.85);
      ctxFinal.drawImage(this.bannerConfig.StandImage.el, -1, 1);
    }

    return (
      <div className={cx('clan-banner', { loading: this.state.loading } )}>
        {this.state.loading ? <Spinner /> : null}
        <canvas ref='canvas' width={canvasWidth} height={canvasHeight} />
      </div>
    );
  }
}

export default ClanBanner;
