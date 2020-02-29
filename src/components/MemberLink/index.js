import React from 'react';
import cx from 'classnames';
import * as entities from 'entities';

import { t } from '../../utils/i18n';
import * as bungie from '../../utils/bungie';
import * as responseUtils from '../../utils/responseUtils';
import * as utils from '../../utils/destinyUtils';
import store from '../../store';
import ObservedImage from '../ObservedImage';
import Spinner from '../UI/Spinner';
import { Button, DestinyKey } from '../UI/Button';
import Characters from '../UI/Characters';
import { Flair, FlairPrimary } from '../UI/Flair';

import './styles.css';

function fireteamPadding(maxParty = 0, openSlots, partyMemberCount) {
  if (openSlots > 0) {
    if (maxParty > 6 && partyMemberCount < 6) {
      return Array(6 - partyMemberCount).fill({ open: true });
    } else {
      return Array(maxParty - partyMemberCount).fill({ open: true });
    }
  } else {
    return [];
  }
}

class MemberLink extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      member: {
        membershipType: this.props.type,
        membershipId: this.props.id,
        displayName: this.props.displayName
      },
      overrideMember: {},
      basic: {
        loading: true,
        data: false,
        error: false
      },
      all: {
        loading: false,
        data: false,
        error: false
      },
      overlay: false,
      tainted: false
    };
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;

    this.getMinimalProfileData();
  }

  componentDidUpdate(p, s) {
    if (s.overrideMember.membershipId !== this.state.overrideMember.membershipId && !this.state.all.loading && !this.state.all.data) {
      this.getFullProfileData();
    }
  }

  getMembershipType = async membershipId => {
    if (this.mounted) {
      const responseLinkedProfiles = await bungie.GetLinkedProfiles({
        params: {
          membershipId
        }
      });

      if (responseLinkedProfiles?.ErrorCode === 1) {
        const activeProfile = responseLinkedProfiles.Response.profiles?.find(p => p.crossSaveOverride === p.membershipType)
          ? responseLinkedProfiles.Response.profiles?.find(p => p.crossSaveOverride === p.membershipType)
          : responseLinkedProfiles.Response.profiles?.length &&
            Object.values(responseLinkedProfiles.Response.profiles).sort(function(a, b) {
              return new Date(b.dateLastPlayed).getTime() - new Date(a.dateLastPlayed).getTime();
            })[0];

        return activeProfile?.membershipType;
      }
    }
  };

  getMinimalProfileData = async () => {
    try {
      const member = {
        membershipType: this.state.member.membershipType || (await this.getMembershipType(this.state.member.membershipId)),
        membershipId: this.state.member.membershipId,
        displayName: this.state.member.displayName
      };

      const responseProfile = await bungie.GetProfile({
        params: {
          membershipType: member.membershipType,
          membershipId: member.membershipId,
          components: member.displayName ? '200' : '100,200'
        }
      });

      if (this.mounted && responseProfile?.ErrorCode === 1) {
        const profile = responseUtils.profileScrubber(responseProfile.Response, 'activity');

        if (!profile.characters.data || profile.characters.data.length === 0) {
          this.setState(p => ({
            ...p,
            all: {
              ...p.all,
              error: true
            }
          }));
        } else {
          this.setState(p => ({
            ...p,
            member,
            basic: {
              ...p.basic,
              data: profile,
              loading: false,
              error: false
            }
          }));
        }
      } else {
        throw Error;
      }
    } catch (e) {

    }
  };

  getFullProfileData = async () => {
    try {
      const member = {
        membershipType: this.state.overrideMember.membershipType || this.state.member.membershipType,
        membershipId: this.state.overrideMember.membershipId || this.state.member.membershipId
      };

      if (this.mounted) {
        this.setState({
          all: {
            loading: true,
            data: false,
            error: false
          }
        });
      }

      const requests = [
        bungie.GetProfile({
          params: {
            membershipType: member.membershipType,
            membershipId: member.membershipId,
            components: '100,200,202,204,205,800,900,1000'
          }
        }),
        bungie.GetGroupsForMember({
          params: {
            membershipType: member.membershipType,
            membershipId: member.membershipId
          }
        })
      ];

      const [responseProfile, responseGroup] = await Promise.all(requests);

      if (this.mounted && responseProfile && responseProfile.ErrorCode === 1) {
        const profile = responseUtils.profileScrubber(responseProfile.Response, 'activity');
        const group = responseGroup?.ErrorCode === 1 && responseGroup.Response?.results?.length && responseGroup.Response.results[0].group;

        if (!profile.profileRecords.data || (profile.profileRecords.data && Object.entries(profile.profileRecords.data.records).length === 0)) {
          this.setState(p => ({
            all: {
              ...p.all,
              loading: false,
              error: true
            }
          }));

          return;
        }

        this.setState(p => ({
          all: {
            ...p.all,
            error: false,
            data: {
              ...profile,
              group
            },
            loading: false
          }
        }));
      } else {
        throw Error;
      }
    } catch (e) {
      console.log(e);
    }
  };

  handler_activateOverlay = e => {
    const { disableOverlay, handler } = this.props;
    const { member, basic } = this.state;

    if (disableOverlay || !(!basic.loading && basic.data)) return;

    e.stopPropagation();

    if (handler) {
      handler(member);

      return;
    }

    this.setState({
      overlay: true
    });

    this.getFullProfileData();
  };

  handler_newMembership = member => {
    this.setState({
      overrideMember: member,
      all: {
        loading: false,
        data: false,
        error: false
      },
      overlay: true,
      tainted: true
    });
  };

  handler_deactivateOverlay = e => {
    e.stopPropagation();

    if (this.mounted) {
      if (this.state.tainted) {
        this.setState(p => ({
          ...p,
          overrideMember: {},
          all: {
            loading: true,
            data: false,
            error: false
          },
          overlay: false,
          tainted: false
        }));
      } else {
        this.setState({
          overlay: false
        });
      }
    }
  };

  handler_onCharacterClick = characterId => e => {
    const { membershipType, membershipId } = this.state.member;

    store.dispatch({ type: 'MEMBER_LOAD_MEMBERSHIP', payload: { membershipType, membershipId, characterId: characterId } });
  };

  render() {
    const { membershipType, membershipId } = this.state.member;

    const options = {
      characterId: this.props.characterId,
      hideFlair: this.props.hideFlair,
      showClassIcon: this.props.showClassIcon,
      hideEmblemIcon: this.props.hideEmblemIcon
    };

    if (this.state.overlay && this.state.all.data) {
      const timePlayed = Math.floor(
        Object.keys(this.state.all.data.characters.data).reduce((sum, key) => {
          return sum + parseInt(this.state.all.data.characters.data[key].minutesPlayedTotal);
        }, 0) / 1440
      );

      const lastCharacterPlayedArr = Object.entries(this.state.all.data.characterActivities.data).sort((a, b) => {
        let x = new Date(a[1].dateActivityStarted).getTime();
        let y = new Date(b[1].dateActivityStarted).getTime();

        return y - x;
      });

      const lastCharacterPlayed = lastCharacterPlayedArr.length ? lastCharacterPlayedArr[0][0] : lastCharacterPlayedArr;
      const lastActivities = utils.lastPlayerActivity({ profile: { characters: this.state.all.data.characters, characterActivities: this.state.all.data.characterActivities } });
      const lastActivity = lastActivities.find(a => a.characterId === lastCharacterPlayed);

      const profileTransitoryData = this.state.all.data.profileTransitoryData.data;
      const fireteamMembers = (profileTransitoryData?.partyMembers.length && [...profileTransitoryData.partyMembers, ...fireteamPadding(lastActivity.matchmakingProperties?.maxParty, profileTransitoryData.joinability.openSlots, profileTransitoryData.partyMembers.length)]) || [];

      // console.log(profileTransitoryData);

      return (
        <>
          <MemberLinkButton member={this.state.member} basic={this.state.basic} options={options} handler={this.handler_activateOverlay} />
          <div id='member-overlay' className={cx({ error: this.state.all.error })}>
            <div className='wrapper-outer'>
              <div className='background'>
                <div className='border-top' />
                <div className='acrylic' />
              </div>
              <div className={cx('wrapper-inner')}>
                {!this.state.all.loading && this.state.all.data && !this.state.all.error ? (
                  <>
                    <div className='module'>
                      <div className='names'>
                        <div className='displayName'>{this.state.all.data.profile.data && this.state.all.data.profile.data.userInfo.displayName}</div>
                        {this.state.all.data.group ? (
                          <div className='groupName'>{entities.decodeHTML(this.state.all.data.group.name)}</div>
                        ) : null}
                        <Flair type={membershipType} id={membershipId} />
                      </div>
                      <div className='basics'>
                        <div>
                          <div>
                            <div className='name'>{t('Season rank')}</div>
                            <div className='value'>{utils.progressionSeasonRank({ characterId: lastCharacterPlayed, data: { profile: this.state.all.data } }).level}</div>
                          </div>
                          <div>
                            <div className='name'>{t('Time played across characters')}</div>
                            <div className='value'>
                              {timePlayed === 1 ? t('1 day played') : t('{{timePlayed}} days played', { timePlayed })}
                            </div>
                          </div>
                          <div>
                            <div className='name'>{t('Triumph score')}</div>
                            <div className='value'>{this.state.all.data.profileRecords.data.score.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className='name'>{t('Collection total')}</div>
                            <div className='value'>{utils.collectionTotal(this.state.all.data).toLocaleString()}</div>
                          </div>
                        </div>
                        <div>
                          <div>
                            <div className='name'>{t('Valor points')}</div>
                            <div className='value'>{this.state.all.data.characterProgressions?.data[lastCharacterPlayed]?.progressions[2626549951]?.currentProgress.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className='name'>{t('Glory points')}</div>
                            <div className='value'>{this.state.all.data.characterProgressions?.data[lastCharacterPlayed]?.progressions[2000925172]?.currentProgress.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className='name'>{t('Infamy points')}</div>
                            <div className='value'>{this.state.all.data.characterProgressions?.data[lastCharacterPlayed]?.progressions[2772425241]?.currentProgress.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='module'>
                      <div className='sub-header'>
                        <div>{t('Characters')}</div>
                      </div>
                      <Characters member={{ data: { profile: this.state.all.data }, membershipId, membershipType, characterId: lastCharacterPlayed }} onClickCharacter={this.handler_onCharacterClick} mini colourised />
                    </div>
                    <div className='module fireteam'>
                      <div className='sub-header'>
                        <div>{t('Fireteam')}</div>
                      </div>
                      {fireteamMembers.length ? (
                        <>
                          <div className='status'>
                            <div className='open-slots'>
                              {t('Fireteam members')}: {profileTransitoryData.partyMembers.length} / {lastActivity.matchmakingProperties?.maxParty}
                            </div>
                            {profileTransitoryData.currentActivity.numberOfPlayers > 0 ? (
                              <div className='player-count'>
                                {t('Player count')}: {profileTransitoryData.currentActivity.numberOfPlayers} / {lastActivity.matchmakingProperties?.maxPlayers}
                              </div>
                            ) : null}
                          </div>
                          <ul className='list fireteam-members'>
                            {fireteamMembers.map((member, m) => {
                              if (member.open) {
                                return (
                                  <li key={m}>
                                    <div className='placeholder' />
                                  </li>
                                );
                              }

                              return (
                                <li key={m}>
                                  <MemberLink id={member.membershipId} displayName={member.displayName} handler={this.handler_newMembership} />
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      ) : (
                        <div className='info'>{t('Offline')}</div>
                      )}
                    </div>
                  </>
                ) : this.state.all.error ? (
                  <>
                    <div>
                      <div className='icon'>
                        <ObservedImage className='image' src='/static/images/extracts/ui/010A-00000552.PNG' />
                      </div>
                    </div>
                    <div>
                      <div className='text'>
                        <div className='name'>{t('Private profile')}</div>
                        <div className='description'>{t('This user has their profile privacy set to private')}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Spinner />
                )}
              </div>
              <div className='sticky-nav mini ultra-black'>
                <div className='sticky-nav-inner'>
                  <div />
                  <ul>
                    <li>
                      <Button action={this.handler_deactivateOverlay}>
                        <DestinyKey type='dismiss' /> {t('Dismiss')}
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    } else if (this.state.overlay && this.state.basic.data) {
      return (
        <>
          <MemberLinkButton member={this.state.member} basic={this.state.basic} options={options} handler={this.handler_activateOverlay} />
          <div id='member-overlay' className={cx({ error: this.state.all.error })}>
            <div className='wrapper-outer'>
              <div className='background'>
                <div className='border-top' />
                <div className='acrylic' />
              </div>
              <div className={cx('wrapper-inner')}>
                {this.state.all.error ? (
                  <>
                    <div>
                      <div className='icon'>
                        <ObservedImage className='image' src='/static/images/extracts/ui/010A-00000552.PNG' />
                      </div>
                    </div>
                    <div>
                      <div className='text'>
                        <div className='name'>{t('Private profile')}</div>
                        <div className='description'>{t('This user has their profile privacy set to private')}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Spinner />
                )}
              </div>
              <div className='sticky-nav mini ultra-black'>
                <div className='sticky-nav-inner'>
                  <div />
                  <ul>
                    <li>
                      <Button action={this.handler_deactivateOverlay}>
                        <DestinyKey type='dismiss' /> {t('Dismiss')}
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    } else if (this.state.basic.data) {
      return <MemberLinkButton member={this.state.member} basic={this.state.basic} options={options} handler={this.handler_activateOverlay} />;
    } else {
      return <MemberLinkButton member={this.state.member} basic={this.state.basic} options={options} handler={this.handler_activateOverlay} />;
    }
  }
}

class MemberLinkButton extends React.Component {
  componentWillUnmount() {
    this.mounted = false;
  }

  async componentDidMount() {
    this.mounted = true;
  }

  render() {
    const { member, basic, options, handler } = this.props;

    let characterBasic;
    if (basic.data) {
      if (options.characterId) {
        characterBasic = basic.data.characters.data.find(c => c.characterId === options.characterId);
        if (!characterBasic) characterBasic = basic.data.characters.data[0];
      } else {
        characterBasic = basic.data.characters.data[0];
      }
    }

    return (
      <div className={cx('member-link', { wait: !(!basic.loading && basic.data) })} onClick={handler}>
        {!options.hideFlair ? <FlairPrimary id={member.membershipId} /> : null}
        <div className='emblem'>
          {!basic.loading && basic.data ? (
            options.showClassIcon ? (
              <div className='icon'>
                <i
                  className={`destiny-class_${utils
                    .classTypeToString(characterBasic.classType)
                    .toString()
                    .toLowerCase()}`}
                />
              </div>
            ) : !options.hideEmblemIcon ? (
              <ObservedImage className='image' src={`https://www.bungie.net${characterBasic.emblemPath || '/img/misc/missing_icon_d2.png'}`} />
            ) : null
          ) : null}
        </div>
        <div className='displayName'>{member.displayName ? member.displayName : !basic.loading && basic.data ? basic.data.profile.data.userInfo.displayName : null}</div>
      </div>
    );
  }
}

// class MemberLinkButton2 extends React.Component {
//   componentWillUnmount() {
//     this.mounted = false;
//   }

//   async componentDidMount() {
//     this.mounted = true;

//     this.getMinimalProfileData();
//   }

//   render() {
//     return null;
//   }
// }

// MemberLinkButton2 = compose(withTranslation())(MemberLinkButton2);

export default MemberLink;
