import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import packageJSON from '../../../package.json';
import Spinner from '../../components/UI/Spinner';
import { ReactComponent as Logo } from '../../svg/miscellaneous/braytech-device.svg';
import { ReactComponent as Saint14 } from '../../svg/miscellaneous/saint-14.svg';

import './styles.css';

class Loading extends React.Component {
  constructor(props) {
    super(props);

    const { t } = this.props;

    this.state = {};

    this.loadingStates = {
      error: {
        isError: true,
        status: t('Fatal error'),
        displayProperties: {
          name: t('Unknown error'),
          description: t('Something very unexpected and irrecoverable occurred.')
        }
      },
      error_setUpManifest: {
        isError: true,
        status: t('Fatal error'),
        displayProperties: {
          name: t('Manifest error'),
          description: t('Something went wrong while trying to update the item manifest.\n\nPlease refresh the app and try again.')
        }
      },
      error_fetchingManifest: {
        isError: true,
        status: t('Fatal error'),
        displayProperties: {
          name: t('Manifest download failed'),
          description: t('Something went wrong while trying to download the item manifest from Bungie.\n\nPlease refresh the app and try again.')
        }
      },
      error_maintenance: {
        shh: true,
        status: ' ',
        displayProperties: {
          name: t('Bungie Maintenance'),
          description: t('The Bungie API is currently down for maintenance.\n\nTune into @BungieHelp on Twitter for more information.')
        }
      },
      navigator_offline: {
        isError: true,
        status: t('No internet'),
        displayProperties: {
          name: t('No internet'),
          description: t('Are you offline? Your web browser thinks you are...')
        }
      },
      checkManifest: {
        status: t('Verifying manifest data')
      },
      fetchManifest: {
        status: t('Downloading data from Bungie')
      },
      setManifest: {
        status: t('Saving manifest data')
      },
      loadingPreviousProfile: {
        status: t('Loading previous member')
      },
      loadingProfile: {
        status: t('Loading member')
      },
      else: {
        status: t('Starting Windows 95')
      }
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.state !== this.props.state) {
      const state = this.props.state;

      if (this.loadingStates[state.code] && (this.loadingStates[state.code].isError || this.loadingStates[state.code].shh)) {
        this.props.pushNotification({
          error: true,
          date: new Date().toISOString(),
          expiry: 86400000,
          displayProperties: {
            ...this.loadingStates[state.code] && this.loadingStates[state.code].displayProperties,
            prompt: true
          },
          javascript: state.detail
        });
      }
    }
  }

  render() {
    const { state } = this.props;

    if (state.code) {
      const status = (this.loadingStates[state.code] && this.loadingStates[state.code].status) || this.loadingStates.else.status;
      const isError = this.loadingStates[state.code] && (this.loadingStates[state.code].isError || this.loadingStates[state.code].shh);

      return (
        <div className='view' id='loading'>
          <div className='bg'>
            <div className='containment'>
              <Saint14 />
            </div>
          </div>
          <div className='logo-feature'>
            <div className='device'>
              <Logo />
            </div>
          </div>
          <div className='text'>
            <div className='version'>Braytech {packageJSON.version}</div>
            <div className={cx('status', { error: isError })}>
              {!isError ? (
                <div>
                  <Spinner mini dark />
                </div>
              ) : null}
              <div>{status}</div>
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    pushNotification: value => {
      dispatch({ type: 'PUSH_NOTIFICATION', payload: value });
    }
  };
}

export default compose(
  connect(
    null,
    mapDispatchToProps
  ),
  withTranslation()
)(Loading);
