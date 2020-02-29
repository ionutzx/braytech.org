import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import * as utils from '../../../utils/destinyUtils';
import { ProfileNavLink } from '../../ProfileLink';
import ProgressBar from '../../UI/ProgressBar';
import Footer from '../Footer';
import { EmblemIcon, EmblemBackground } from '../Emblem/';
import Spinner from '../Spinner';

import './styles.css';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navOpen: false,
      lastUpdate: false,
      updateFlash: false
    };

    this.updateFlash = false;
    this.navEl = React.createRef();
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.member.data.updated !== this.props.member.data.updated && this.state.lastUpdate !== this.props.member.data.updated && !this.state.updateFlash && this.mounted) {
      this.setState({ lastUpdate: this.props.member.data.updated, updateFlash: true });
    }
    if (this.state.updateFlash) {
      window.setTimeout(() => {
        if (this.mounted) {
          this.setState({ updateFlash: false });
        }
      }, 4000);
    }
    if (this.state.navOpen) {
      this.navEl.current.addEventListener('touchmove', this.nav_touchMove, true);
    }
  }

  handler_toggleNav = () => {
    if (!this.state.navOpen) {
      this.setState({ navOpen: true });
    } else {
      this.setState({ navOpen: false });
    }
  };

  handler_closeNav = () => {
    if (this.state.navOpen) {
      this.setState({ navOpen: false });
    }
  };

  handler_openNav = () => {
    this.setState({ navOpen: true });
  };

  navOverlayLink = state => {
    if (state) {
      return (
        <div className='trigger' onClick={this.handler_toggleNav}>
          <i className='segoe-uniE106' />
          {this.props.t('Exit')}
        </div>
      );
    } else {
      return (
        <div className='trigger' onClick={this.handler_toggleNav}>
          <i className='segoe-uniEA55' />
          {this.props.t('Views')}
        </div>
      );
    }
  };

  render() {
    const { t, location, viewport, member, refresh } = this.props;

    const isProfileRoute = utils.isProfileRoute(location) && member.data;

    const views = [
      {
        name: t('Clan'),
        desc: t('About your clan, its roster, summative historical stats for all members, and admin mode'),
        slug: '/clan',
        exact: false,
        profile: true,
        inline: true,
        group: 0
      },
      {
        name: t('Collections'),
        desc: t('Items your Guardian has acquired over their lifetime'),
        slug: '/collections',
        exact: false,
        profile: true,
        inline: true,
        group: 0
      },
      {
        name: t('Triumphs'),
        desc: t('Records your Guardian has achieved through their trials'),
        slug: '/triumphs',
        exact: false,
        profile: true,
        inline: true,
        group: 0
      },
      {
        name: t('Checklists'),
        desc: t('Ghost scans and item checklists spanning the Sol system'),
        slug: '/checklists',
        exact: true,
        profile: true,
        inline: true,
        group: 0
      },
      {
        name: t('Maps'),
        desc: t('Interactive maps charting checklists and other notable destinations'),
        slug: '/maps',
        exact: false,
        profile: false,
        inline: !isProfileRoute || viewport.width >= 1400,
        group: 0
      },
      {
        name: t('This Week'),
        desc: t('Noteworthy records and collectibles which are available at a weekly cadence'),
        slug: '/this-week',
        exact: false,
        profile: true,
        inline: true,
        group: 0
      },
      {
        name: t('Now'),
        desc: t('The state of your Guardian, artifact, ranks, season pass, daily activities, and more'),
        slug: '/now',
        exact: false,
        profile: true,
        inline: true,
        group: 0
      },
      {
        name: t('Quests'),
        desc: t('Track your pursuits, including quests and bounties'),
        slug: '/quests',
        exact: false,
        profile: true,
        inline: !isProfileRoute || viewport.width >= 1320,
        group: 0
      },
      {
        name: t('Reports'),
        desc: t('Explore and filter your Post Game Carnage Reports in detail'),
        slug: '/reports',
        exact: false,
        profile: true,
        inline: !isProfileRoute || viewport.width >= 1500,
        group: 0
      },
      {
        name: t('More'),
        slug: '/',
        exact: true,
        profile: false,
        inline: true,
        hidden: true
      },
      {
        name: '',
        desc: t('Account, theme, local data, item visibility, language, developer, troubleshooting'),
        slug: '/settings',
        exact: true,
        inline: true,
        group: 0
      },
      {
        name: t('Compare'),
        desc: t('Find your fastest completions for Nightfalls and Nightmare Hunts'),
        slug: '/compare',
        exact: false,
        profile: false,
        group: 1
      },
      {
        name: t('Legend'),
        desc: t('Generate an infographic that details your Destiny legend'),
        slug: '/legend',
        exact: false,
        profile: false,
        group: 1
      },
      {
        name: t('Commonality'),
        desc: t("A summary of Destiny's most rare records and collectibles"),
        slug: '/commonality',
        exact: false,
        profile: false,
        group: 1
      },
      {
        name: t('Archives'),
        desc: t('Interactive tools, manuals, legends, and other content preserved'),
        slug: '/archives',
        exact: false,
        profile: false,
        group: 1
      },
      {
        group: 1,
        type: 'separator'
      },
      {
        name: t('FAQ'),
        desc: t("Some of Tom's favourite frequently asked questions"),
        slug: '/faq',
        exact: false,
        profile: false,
        group: 1
      },
      {
        name: t('Credits'),
        desc: t('The Architects and Guardians that make Braytech possible'),
        slug: '/credits',
        exact: false,
        profile: false,
        group: 1
      }
    ];

    const viewsInline = viewport.width >= 1280;

    const isActive = (match, location) => {
      if (match) {
        return true;
      } else {
        return false;
      }
    };

    const profile = member.data?.profile?.profile.data;
    const characters = member.data?.profile?.characters.data;
    const character = characters?.find(character => character.characterId === member.characterId);

    const progressSeasonalRank = member?.data && utils.progressionSeasonRank(member);

    return (
      <div id='header' className={cx(this.props.theme.selected, { 'profile-header': isProfileRoute, navOpen: this.state.navOpen })}>
        <div className='braytech'>
          <div className='wrapper'>
            <div className='logo'>
              <Link to='/' onClick={this.handler_closeNav}>
                <span className='destiny-clovis_bray_device' />
                {process.env.REACT_APP_BETA === 'true' ? 'Braytech Beta' : 'Braytech'}
              </Link>
            </div>
            {!viewsInline || this.state.navOpen ? this.navOverlayLink(this.state.navOpen) : null}
            {!isProfileRoute && viewsInline && !this.state.navOpen ? (
              <div className='ui'>
                <div className='views'>
                  <ul>
                    {views
                      .filter(v => v.inline)
                      .map(view => {
                        if (view.profile) {
                          return (
                            <li key={view.slug}>
                              <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact}>
                                {view.name}
                              </ProfileNavLink>
                            </li>
                          );
                        } else if (view.hidden) {
                          return (
                            <li key='more'>
                              <Link
                                to={view.slug}
                                onClick={e => {
                                  e.preventDefault();
                                  this.handler_openNav();
                                }}
                              >
                                {view.name}
                              </Link>
                            </li>
                          );
                        } else {
                          return (
                            <li key={view.slug}>
                              <NavLink to={view.slug} exact={view.exact}>
                                {view.name}
                              </NavLink>
                            </li>
                          );
                        }
                      })}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {isProfileRoute && character ? (
          <div className='profile'>
            <div className={cx('background', { 'update-flash': this.state.updateFlash })}>
              <EmblemBackground hash={character.emblemHash} />
            </div>
            <div className='ui'>
              <div className='characters'>
                <ul className='list'>
                  <li>
                    <div className='icon'>
                      <EmblemIcon hash={character.emblemHash} />
                    </div>
                    <div className='displayName'>{profile.userInfo.displayName}</div>
                    <div className='basics'>
                      {progressSeasonalRank.level} / {utils.classHashToString(character.classHash, character.genderType)} / <span className='light'>{character.light}</span>
                    </div>
                    <ProgressBar hideCheck {...progressSeasonalRank} />
                    <Spinner className={refresh.loading ? 'visible' : undefined} mini />
                    <Link
                      to={{
                        pathname: '/character-select',
                        state: { from: this.props.location }
                      }}
                    />
                  </li>
                </ul>
              </div>
              {viewsInline ? (
                <div className='views'>
                  <ul>
                    {views
                      .filter(v => v.inline)
                      .map(view => {
                        if (view.profile) {
                          return (
                            <li key={view.slug}>
                              <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact}>
                                {view.name}
                              </ProfileNavLink>
                            </li>
                          );
                        } else if (view.hidden) {
                          return (
                            <li key='more'>
                              <Link
                                to={view.slug}
                                onClick={e => {
                                  e.preventDefault();
                                  this.handler_openNav();
                                }}
                              >
                                {view.name}
                              </Link>
                            </li>
                          );
                        } else {
                          return (
                            <li key={view.slug}>
                              <NavLink to={view.slug} exact={view.exact}>
                                {view.name}
                              </NavLink>
                            </li>
                          );
                        }
                      })}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        {this.state.navOpen ? (
          <div className='nav' ref={this.navEl}>
            <div className='wrap'>
              <div className='types'>
                <div className='type progression'>
                  <ul>
                    {views
                      .filter(v => v.group === 0 && !v.hidden)
                      .map(view => {
                        if (view.profile) {
                          return (
                            <li key={view.slug}>
                              <div className='name'>{view.name}</div>
                              <div className='description'>{view.desc}</div>
                              <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact} onClick={this.handler_closeNav} />
                            </li>
                          );
                        } else {
                          return (
                            <li key={view.slug}>
                              <div className='name'>{view.name}</div>
                              <div className='description'>{view.desc}</div>
                              <NavLink to={view.slug} exact={view.exact} onClick={this.handler_closeNav} />
                            </li>
                          );
                        }
                      })}
                  </ul>
                </div>
                <div className='type ancillary'>
                  <ul>
                    {views
                      .filter(v => v.group === 1 && !v.hidden)
                      .map((view, i) => {
                        if (view.type === 'separator') {
                          return <li key={i} className='separator' />;
                        } else if (view.profile) {
                          return (
                            <li key={view.slug}>
                              <div className='name'>{view.name}</div>
                              <div className='description'>{view.desc}</div>
                              <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact} onClick={this.handler_closeNav} />
                            </li>
                          );
                        } else {
                          return (
                            <li key={view.slug}>
                              <div className='name'>{view.name}</div>
                              <div className='description'>{view.desc}</div>
                              <NavLink to={view.slug} exact={view.exact} onClick={this.handler_closeNav} />
                            </li>
                          );
                        }
                      })}
                  </ul>
                </div>
                {/* <div className='type external'>
                  DIM
                  <br />
                  Ishtar Collective
                </div> */}
              </div>
              <Footer minimal linkOnClick={this.handler_closeNav} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    refresh: state.refresh,
    theme: state.theme,
    viewport: state.viewport
  };
}

export default compose(connect(mapStateToProps), withTranslation())(Header);
