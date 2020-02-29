import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import cx from 'classnames';
import ReactGA from 'react-ga';

import ObservedImage from '../../ObservedImage';
import { Button, DestinyKey } from '../../UI/Button';

import './styles.css';

class NotificationLink extends React.Component {
  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  deactivateOverlay = e => {
    e.stopPropagation();

    let state = this.active && this.active.length ? this.active[0] : false;

    if (this.mounted) {
      if (state.displayProperties.timeout) {
        this.clearTimeout();
      }

      this.props.popNotification(state.id);

      ReactGA.event({
        category: state.displayProperties && state.displayProperties.name ? state.displayProperties.name : 'unknown',
        action: 'dismiss'
      });
    }
  };

  setTimeout = timeout => {
    this.notificationTimeout = window.setTimeout(this.sunsetNotifcation, timeout * 1000);
  };

  clearTimeout() {
    window.clearInterval(this.notificationTimeout);
  }

  sunsetNotifcation = () => {
    if (this.active && this.active.length ? this.active[0] : false) {
      const state = this.active[0];

      if (state.displayProperties.timeout) {
        this.props.popNotification(state.id);
      }
    }
  };

  componentDidUpdate(prevProps) {
    if (this.active && this.active.length) {
      const state = this.active[0];

      if (state.displayProperties.timeout) {
        this.clearTimeout();
        this.setTimeout(state.displayProperties.timeout);
      }
    }
  }

  render() {
    const { t } = this.props;

    const timeNow = new Date().getTime();

    this.active = this.props.notifications?.objects.length
      ? this.props.notifications.objects.filter(o => {
          const objDate = new Date(o.date).getTime();

          if (objDate + o.expiry > timeNow) {
            return true;
          } else {
            return false;
          }
        })
      : [];

    const remainingInline = this.active.filter(a => !a.displayProperties.prompt).length - 1;

    if (this.active.length ? this.active[0] : false) {
      const state = this.active[0];

      let isError,
        image,
        actions = state.actions || [];
      
      if (state && state.error && state.javascript?.message === 'maintenance') {
        image = '/static/images/extracts/ui/01A3-00001EE8.PNG';
        actions = [
          {
            type: 'external',
            target: 'https://twitter.com/BungieHelp',
            text: 'Go to Twitter',
            key: 'accept',
            dismiss: false
          }
        ];
      } else if (state && state.error) {
        isError = true;
        image = '/static/images/extracts/ui/010A-00000552.PNG';
      } else if (state && state.displayProperties?.image) {
        image = state.displayProperties.image;
      } else {
        image = '/static/images/extracts/ui/010A-00000554.PNG';
      }

      actions = [
        ...actions,
        {
          type: 'dismiss',
          dismiss: true
        }
      ];

      if (state && state.displayProperties?.prompt) {
        return (
          <div id='notification-overlay' className={cx({ error: isError })}>
            <div className='wrapper-outer'>
              <div className='background'>
                <div className='border-top' />
                <div className='acrylic' />
              </div>
              <div className={cx('wrapper-inner', { 'has-image': state.displayProperties && state.displayProperties.image })}>
                <div>
                  <div className='icon'>
                    <ObservedImage className='image' src={image} />
                  </div>
                </div>
                <div>
                  <div className='text'>
                    <div className='name'>{state.displayProperties && state.displayProperties.name ? state.displayProperties.name : 'Unknown'}</div>
                    <div className='description'>{state.displayProperties && state.displayProperties.description ? <ReactMarkdown source={state.displayProperties.description} /> : 'Unknown'}</div>
                  </div>
                </div>
              </div>
              <div className='sticky-nav mini ultra-black'>
                <div className='sticky-nav-inner'>
                  <div />
                  <ul>
                    {actions.map((action, i) => {
                      if (action.type === 'external') {
                        return (
                          <li key={i}>
                            <a className='button' href={action.target} onClick={action.dismiss ? this.deactivateOverlay : null} target='_blank' rel='noreferrer noopener'>
                              <DestinyKey type={action.key || 'dismiss'} /> {action.text}
                            </a>
                          </li>
                        );
                      } else {
                        return (
                          <li key={i}>
                            <Button action={this.deactivateOverlay}>
                              <DestinyKey type='dismiss' /> {t('Dismiss')}
                            </Button>
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div key={state.id} id='notification-bar' className={cx({ error: isError })} style={{'--timeout': `${state.displayProperties?.timeout || 4}s`}} onClick={this.deactivateOverlay}>
            <div className='wrapper-outer'>
              <div className='background'>
                <div className='border-top'>
                  <div className='inner' />
                </div>
                <div className='acrylic' />
              </div>
              <div className='wrapper-inner'>
                <div>
                  <div className='icon'>
                    <span className='destiny-ghost' />
                  </div>
                </div>
                <div>
                  <div className='text'>
                    <div className='name'>
                      <p>{state.displayProperties && state.displayProperties.name ? state.displayProperties.name : t('Unknown')}</p>
                    </div>
                    <div className='description'>{state.displayProperties?.description ? <ReactMarkdown source={state.displayProperties.description} /> : <p>{t('Unknown')}</p>}</div>
                  </div>
                  {remainingInline > 0 ? (
                    <div className='more'>
                      <p>{t('And {{number}} more', { number: remainingInline })}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return null;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    notifications: state.notifications
  };
}

function mapDispatchToProps(dispatch) {
  return {
    popNotification: value => {
      dispatch({ type: 'POP_NOTIFICATION', payload: value });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(NotificationLink);
