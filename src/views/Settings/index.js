import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getLanguageInfo } from '../../utils/languageInfo';
import * as ls from '../../utils/localStorage';
import { BungieAuth } from '../../components/BungieAuth';
import Checkbox from '../../components/UI/Checkbox';
import Button from '../../components/UI/Button';

import translationStats from '../../data/translationStats';

import './styles.css';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    let initLanguage = this.props.i18n.getCurrentLanguage();

    this.state = {
      language: {
        current: initLanguage,
        selected: initLanguage
      },
      swInstalled: false,
      swUpdateAttempt: false,
      swUnregisterAttempt: false
    };
  }

  selectCollectibleDisplayState = state => e => {
    this.props.setCollectibleDisplayState({
      ...this.props.collectibles,
      [state]: !this.props.collectibles[state]
    });
  };

  selectLanguage = lang => {
    this.setState(p => ({ ...p, language: { ...p.language, selected: lang } }));
  };

  saveAndRestart = () => {
    const { i18n } = this.props;

    i18n.setCurrentLanguage(this.state.language.selected);

    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  swUpdate = () => {
    if (this.mounted) this.setState({ swUpdateAttempt: true });

    navigator.serviceWorker.getRegistration('/').then(function(registration) {
      registration.update();
    });
  };

  swDump = () => {
    if (this.mounted) this.setState({ swUnregisterAttempt: true });

    navigator.serviceWorker.getRegistration('/').then(function(registration) {
      registration.unregister();
      console.log(registration);
    });
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    this.mounted = true;

    const swInstalled = await this.swInstalled();

    if (this.mounted && swInstalled) this.setState({ swInstalled: true });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  swAvailable = process.env.NODE_ENV === 'production' && process.env.REACT_APP_BETA === 'true' && 'serviceWorker' in navigator;

  swInstalled = async () => {
    if (this.swAvailable) {
      let registration = await navigator.serviceWorker.getRegistration('/');

      if (registration) return true;
    }

    return false;
  };

  handler_toggleMapsDebugMode = e => {
    if (this.props.maps.debug) {
      this.props.setMaps({ debug: false });
    } else {
      this.props.setMaps({ debug: true });
    }
  };

  handler_toggleMapsDebugModeNoScreenshotHighlight = e => {
    if (this.props.maps.noScreenshotHighlight) {
      this.props.setMaps({ noScreenshotHighlight: false });
    } else {
      this.props.setMaps({ noScreenshotHighlight: true });
    }
  };

  handler_toggleMapsDebugModeLogDetails = e => {
    if (this.props.maps.logDetails) {
      this.props.setMaps({ logDetails: false });
    } else {
      this.props.setMaps({ logDetails: true });
    }
  };

  handler_setTheme = theme => e => {
    this.props.setTheme(theme);
  };

  handler_toggleThree = e => {
    this.props.setThree({ enabled: !this.props.three.enabled });
  };

  handler_toggleThreeDebugMode = e => {
    this.props.setThree({ debug: !this.props.three.debug });
  };

  handler_toggleThreeShadows = e => {
    this.props.setThree({ shadows: !this.props.three.shadows });
  };

  handler_resetLayouts = e => {
    this.props.resetLayouts({ target: false });
  };

  handler_resetTrackedTriumphs = e => {
    this.props.setTrackedTriumphs([]);
  };

  handler_resetTipsState = e => {
    this.props.setTips([]);
  };

  handler_resetProfileHistory = e => {
    ls.set('history.profiles', []);
  };

  handler_resetNotificationsState = e => {
    ls.set('history.notifications', []);
  };

  handler_reloadApp = e => {
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  render() {
    const { t, availableLanguages, location } = this.props;

    const languageButtons = availableLanguages.map(code => {
      const langInfo = getLanguageInfo(code);

      return (
        <li
          key={code}
          onClick={() => {
            this.selectLanguage(code);
          }}
        >
          <Checkbox linked checked={this.state.language.selected === code}>
            <div className='text'>
              <div className='name'>{langInfo.name || langInfo.code}</div>
              <div className='coverage tooltip' data-hash='coverage' data-type='braytech'>
                {translationStats[langInfo.code] && Math.floor(((translationStats['en'].translated - translationStats[langInfo.code].notTranslated) / translationStats['en'].translated) * 100)}%
              </div>
            </div>
          </Checkbox>
        </li>
      );
    });

    return (
      <div className='view' id='settings'>
        <div className='module head'>
          <div className='page-header'>
            <div className='name'>{t('Settings')}</div>
          </div>
        </div>
        <div className='buff'>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Bungie.net profile')}</div>
            </div>
            <BungieAuth location={location} />
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Theme')}</div>
            </div>
            <ul className='list settings'>
              <li onClick={this.handler_setTheme('light-mode')}>
                <Checkbox linked checked={this.props.theme.selected === 'light-mode'} text={t('Light mode')} />
              </li>
              <li onClick={this.handler_setTheme('dark-mode')}>
                <Checkbox linked checked={this.props.theme.selected === 'dark-mode'} text={t('Dark mode')} />
              </li>
            </ul>
            <div className='sub-header sub'>
              <div>{t('Local data')}</div>
            </div>
            <div className='buttons'>
              <Button text={t('Reset profile history')} action={this.handler_resetProfileHistory} />
              <div className='info'>
                <p>{t('Deletes the stored list of previously loaded member profiles (character select)')}</p>
              </div>
              <Button text={t('Reset tracked triumphs')} action={this.handler_resetTrackedTriumphs} />
              <div className='info'>
                <p>{t('Untrack all user-tracked triumphs. Will not affect the state of in-game triumphs.')}</p>
              </div>
              <Button text={t('Reset tips')} action={this.handler_resetTipsState} />
              <div className='info'>
                <p>{t('Restore informational tips to their default state')}</p>
              </div>
              <Button text={t('Reset notifications')} action={this.handler_resetNotificationsState} />
              <div className='info'>
                <p>{t('Reset dismissed notifications to their default state')}</p>
              </div>
              <Button text={t('Reset customisable layouts')} action={this.handler_resetLayouts} />
              <div className='info'>
                <p>{t('Reset customisable layouts to their default arrangements')}</p>
              </div>
            </div>
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('3D models')}</div>
            </div>
            <ul className='list settings'>
              <li onClick={this.handler_toggleThree}>
                <Checkbox linked checked={this.props.three.enabled} text={t('Use 3D models')} />
                <div className='info'>
                  <p>{t('Where available, use 3D models. Not recommended for phones or low processing-power devices.')}</p>
                </div>
              </li>
              {this.props.three.enabled && 2 === 3 ? (
                <>
                  <li onClick={this.handler_toggleThreeShadows}>
                    <Checkbox linked checked={this.props.three.shadows} text={t('Use shadows')} />
                    <div className='info'>
                      <p>{t('Models will cast shadows upon themselves for a more realistic and true representation. Affects performance.')}</p>
                    </div>
                  </li>
                </>
              ) : null}
            </ul>
            <div className='sub-header sub'>
              <div>{t('Item visibility')}</div>
            </div>
            <ul className='list settings'>
              <li onClick={this.selectCollectibleDisplayState('hideCompletedChecklistItems')}>
                <Checkbox linked checked={this.props.collectibles.hideCompletedChecklistItems} text={t('Hide completed checklist items')} />
                <div className='info'>
                  <p>{t('If a checklist item is completed, it will be hidden under Checklist view.')}</p>
                </div>
              </li>
              <li onClick={this.selectCollectibleDisplayState('hideCompletedRecords')}>
                <Checkbox linked checked={this.props.collectibles.hideCompletedRecords} text={t('Hide completed triumphs')} />
                <div className='info'>
                  <p>{t('If a triumph record is completed and redeemed, it will be hidden under Triumphs views.')}</p>
                </div>
              </li>
              <li onClick={this.selectCollectibleDisplayState('hideInvisibleRecords')}>
                <Checkbox linked checked={this.props.collectibles.hideInvisibleRecords} text={t('Hide invisible triumph records')} />
                <div className='info'>
                  <p>{t('If the game specifies that you are unable to see a particular triumph record, it will be hidden under Triumphs views.')}</p>
                </div>
              </li>
              <li onClick={this.selectCollectibleDisplayState('hideDudRecords')}>
                <Checkbox linked checked={this.props.collectibles.hideDudRecords} text={t('Hide dud records')} />
                <div className='info'>
                  <p>{t('Hides dud (empty, unused, or unobtainable) records from view')}</p>
                </div>
              </li>
              <li onClick={this.selectCollectibleDisplayState('hideCompletedCollectibles')}>
                <Checkbox linked checked={this.props.collectibles.hideCompletedCollectibles} text={t('Hide acquired collection items')} />
                <div className='info'>
                  <p>{t('If a collectible has been acquired, it will be hidden under Collections views.')}</p>
                </div>
              </li>
              <li onClick={this.selectCollectibleDisplayState('hideInvisibleCollectibles')}>
                <Checkbox linked checked={this.props.collectibles.hideInvisibleCollectibles} text={t('Hide invisible collection items')} />
                <div className='info'>
                  <p>{t('If the game specifies that you are unable to see a particular collectible, it will be hidden under Collections views.')}</p>
                </div>
              </li>
            </ul>
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Language')}</div>
            </div>
            <ul className='list settings'>{languageButtons}</ul>
            <Button text={t('Save and restart')} disabled={this.state.language.current === this.state.language.selected} action={this.saveAndRestart} />
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Developer')}</div>
            </div>
            <ul className='list settings'>
              <li onClick={this.handler_toggleThreeDebugMode}>
                <Checkbox linked checked={this.props.three.debug} text={t('Three.js debug mode')} />
                <div className='info'>
                  <p>{t('Displays extra information for debugging Three.js instances')}</p>
                </div>
              </li>
              <li onClick={this.handler_toggleMapsDebugMode}>
                <Checkbox linked checked={this.props.maps.debug} text={t('Maps debug mode')} />
                <div className='info'>
                  <p>{t('Enable Maps debugging settings')}</p>
                </div>
              </li>
              {this.props.maps.debug ? (
                <>
                  <li onClick={this.handler_toggleMapsDebugModeNoScreenshotHighlight}>
                    <Checkbox linked checked={this.props.maps.noScreenshotHighlight} text={t('Highlight nodes without screenshots')} />
                    <div className='info'>
                      <p>{t('Map nodes, such as region chests, which do not have an associated screenshot will be highlighted in order to assist users with contributing to maps data.')}</p>
                    </div>
                  </li>
                  <li onClick={this.handler_toggleMapsDebugModeLogDetails}>
                    <Checkbox linked checked={this.props.maps.logDetails} text={t('Log node details')} />
                    <div className='info'>
                      <p>{t('Console.log details for the mouse-invoked node.')}</p>
                    </div>
                  </li>
                </>
              ) : null}
            </ul>
            <div className='sub-header sub'>
              <div>{t('Troubleshooting')}</div>
            </div>
            <div className='buttons'>
              <Button text={t('Reload')} action={this.handler_reloadApp} />
              <div className='info'>
                <p>{t('Reload the app')}</p>
              </div>
              {this.swAvailable && this.state.swInstalled ? (
                <>
                  <Button text={t('Update service worker')} disabled={!this.state.swInstalled || this.state.swUpdateAttempt || this.state.swUnregisterAttempt} action={this.swUpdate} />
                  <div className='info'>
                    <p>{t('Attempt to update the service worker immediately. This function will disable the button temporarily. You may continue to use Braytech while it attempts to update in the background. If successful, you will be prompted to restart the app.')}</p>
                  </div>
                  <Button text={t('Dump service worker')} disabled={!this.state.swInstalled || this.state.swUnregisterAttempt} action={this.swDump} />
                  <div className='info'>
                    <p>{t('Attempt to unregister the installed service worker. If successful, reloading the app will allow a new service worker to take its place.')}</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme,
    tooltips: state.tooltips,
    collectibles: state.collectibles,
    maps: state.maps,
    three: state.three
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setTheme: value => {
      dispatch({ type: 'SET_THEME', payload: value });
    },
    setTooltipDetailMode: value => {
      dispatch({ type: 'SET_TOOLTIPS_DESIGN', payload: { detailedMode: value } });
    },
    setCollectibleDisplayState: value => {
      dispatch({ type: 'SET_COLLECTIBLES', payload: value });
    },
    setTrackedTriumphs: value => {
      dispatch({ type: 'SET_TRACKED_TRIUMPHS', payload: value });
    },
    setMaps: value => {
      dispatch({ type: 'SET_MAPS', payload: value });
    },
    setThree: value => {
      dispatch({ type: 'SET_THREE', payload: value });
    },
    setTips: value => {
      dispatch({ type: 'SET_TIPS', payload: value });
    },
    resetLayouts: value => {
      dispatch({ type: 'RESET_LAYOUTS', payload: value });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(Settings);
