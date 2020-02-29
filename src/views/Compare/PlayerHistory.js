import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { orderBy } from 'lodash';
import cx from 'classnames';

import * as bungie from '../../utils/bungie';
import * as enums from '../../utils/destinyEnums';
import MemberLink from '../../components/MemberLink';
import Spinner from '../../components/UI/Spinner';

import './styles.css';

const forsakenReleaseDate = new Date('2018-08-04T17:00:00Z');

class PlayerHistory extends React.Component {
  state = {
    loading: false,
    history: []
  };

  fetchActivityHistory = async (membershipType, membershipId, mode) => {
    if (this.mounted) {
      this.setState(p => ({
        ...p,
        loading: true
      }));
    }

    const profileResponse = await bungie.GetProfile({
      params: {
        membershipType,
        membershipId,
        components: [100].join(',')
      }
    });

    const characterIds = profileResponse?.ErrorCode === 1 && profileResponse.Response.profile.data.characterIds;

    const activityHistoryResponses =
      characterIds &&
      (await Promise.all(
        characterIds.map(async c => {
          let count = 250;
          let page = 0;
          const activities = [];

          while (count === 250) {
            const activityHistoryResponse = await bungie.GetActivityHistory({
              params: {
                membershipType: membershipType,
                membershipId: membershipId,
                characterId: c,
                count: 250,
                mode,
                page
              }
            });

            if (activityHistoryResponse?.ErrorCode === 1 && activityHistoryResponse.Response?.activities) {
              count = activityHistoryResponse.Response.activities.length;
              activities.push(...activityHistoryResponse.Response.activities);
            } else {
              // this is a poor man's fix for handling Reponse: {}
              count = 2;
            }

            page++;
          }

          return {
            characterId: c,
            activities
          };
        })
      ));

    if (this.mounted) {
      this.setState(p => ({
        ...p,
        loading: false,
        history: activityHistoryResponses
      }));
    }

    return true;
  };

  componentDidMount() {
    this.mounted = true;

    this.fetchActivityHistory(this.props.membershipType, this.props.membershipId, this.props.mode);

    //this.refreshData();
    //this.startInterval();
  }

  componentWillUnmount() {
    this.mounted = false;

    // this.clearInterval();
  }

  // refreshData = async () => {
  //   if (!this.state.loading) {
  //     //console.log('refresh start');
  //     //         await this.fetch();
  //     //console.log('refresh end');
  //   } else {
  //     //console.log('refresh skipped');
  //   }
  // };

  // startInterval() {
  //   this.refreshDataInterval = window.setInterval(this.refreshData, 30000);
  // }

  // clearInterval() {
  //   window.clearInterval(this.refreshDataInterval);
  // }

  render() {
    const { order, membershipType, membershipId, query, match } = this.props;
    const object = match.params?.object;
    const { loading, history } = this.state;

    const calculated = order.reduce((obj, hash) => {
      const activityDurationSecondsOrdered = orderBy(
        history.map(c => ({
          characterId: c.characterId,
          activities: orderBy(
            c.activities.filter(a => new Date(a.period) > forsakenReleaseDate && a.values.completed.basic.value === 1 && a.values.completionReason.basic.value === 0 && a.activityDetails.directorActivityHash === Number(hash)),
            [a => a.values.activityDurationSeconds.basic.value],
            ['asc']
          )
        })),
        [c => c.activities[0]?.values.activityDurationSeconds.basic.value],
        ['asc']
      );

      obj = {
        ...obj,
        [hash]: {
          fastest: activityDurationSecondsOrdered[0]?.activities[0]
        },
        sum: (obj.sum || 0) + (activityDurationSecondsOrdered[0]?.activities[0]?.values?.activityDurationSeconds?.basic?.value || 0),
        2618436059: object === 'nightfalls' && enums.nightfalls[hash][2618436059] ? (obj[2618436059] || 0) + (activityDurationSecondsOrdered[0]?.activities[0]?.values?.activityDurationSeconds?.basic?.value || 0) : obj[2618436059]
      };

      return obj;
    }, {});

    const queryString = query
      .filter(m => m.membershipId !== membershipId)
      .map(m => `${m.membershipType}:${m.membershipId}`)
      .join('|');

    return (
      <div className={cx('column', 'player', { loading })}>
        {loading ? (
          <div className='spinner-container'>
            <Spinner mini />
          </div>
        ) : null}
        <ul className='list member'>
          <li>
            <MemberLink type={membershipType} id={membershipId} />
          </li>
          <li>
            <Link className='button remove' to={queryString ? `/compare/${object}?members=${queryString}` : `/compare/${object}`}>
              <i className='segoe-uniE8BB' />
            </Link>
          </li>
        </ul>
        <ul className='list'>
          {order.map(hash => {
            return (
              <li key={hash} className={cx('row', { na: !calculated[hash].fastest?.values?.activityDurationSeconds?.basic?.displayValue })}>
                {calculated[hash].fastest?.values?.activityDurationSeconds?.basic?.displayValue || (!loading && '—')}
              </li>
            );
          })}
        </ul>
        <ul className='list sums'>
          <li className={cx('row', { na: calculated.sum === 0 })}>
            {calculated.sum > 0 ? (
              <>
                {Math.floor(calculated.sum / 60)}m {calculated.sum - Math.floor(calculated.sum / 60) * 60}s
              </>
            ) : (
              '—'
            )}
          </li>
          {calculated[2618436059] ? (
            <li className={cx('row', { na: calculated[2618436059] === 0 })}>
              {calculated[2618436059] > 0 ? (
                <>
                  {Math.floor(calculated[2618436059] / 60)}m {calculated[2618436059] - Math.floor(calculated[2618436059] / 60) * 60}s
                </>
              ) : (
                '—'
              )}
            </li>
          ) : null}
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(connect(mapStateToProps), withTranslation(), withRouter)(PlayerHistory);
