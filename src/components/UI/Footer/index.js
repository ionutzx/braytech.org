import React from 'react';
import { Link } from 'react-router-dom';

import { t, fromNow } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';
import packageJSON from '../../../../package.json';
import { ReactComponent as Patreon } from '../../../svg/miscellaneous/patreon-device.svg';
import { ReactComponent as PayPal } from '../../../svg/miscellaneous/paypal-device.svg';

import './styles.css';

class Footer extends React.Component {
  render() {
    const { linkOnClick, minimal } = this.props;

    return (
      <div id='footer'>
        <div className='wrapper'>
          <div>
            <div>© 2020 <a className='hyperlink' href='https://thomchap.com.au' target='_blank' rel='noopener noreferrer'>Tom Chapman</a></div>
            <div>{t('Version')} <span>{packageJSON.version}</span></div>
            {manifest.statistics.scrapes?.last?.time ? <div>{t('VOLUSPA last indexed')} {fromNow(manifest.statistics.scrapes.last.time)}</div> : null}
          </div>
          <ul>
            {!minimal ? (
              <>
                <li>
                  <Link className='hyperlink' to='/faq' onClick={linkOnClick}>
                    {t('FAQ')}
                  </Link>
                </li>
                <li>
                  <Link className='hyperlink' to='/credits' onClick={linkOnClick}>
                    {t('Credits')}
                  </Link>
                </li>
              </>
            ) : null}
            <li>
              <a className='hyperlink' href='https://twitter.com/justrealmilk' target='_blank' rel='noopener noreferrer'>
                Twitter
              </a>
            </li>
            <li>
              <a className='hyperlink' href='https://discordapp.com/invite/8jESWWX' target='_blank' rel='noopener noreferrer'>
                Discord
              </a>
            </li>
            <li>
              <a className='hyperlink' href='https://paypal.me/braytechltd' target='_blank' rel='noopener noreferrer'>
                PayPal <PayPal />
              </a>
            </li>
            <li>
              <a className='hyperlink' href='https://www.patreon.com/braytech' target='_blank' rel='noopener noreferrer'>
                Patreon <Patreon />
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Footer;
