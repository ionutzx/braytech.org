import store from '../store';
import * as ls from './localStorage';

// Bungie API access convenience methods

// class BungieError extends Error {
//   constructor(request) {
//     super(request.Message);

//     this.errorCode = request.ErrorCode;
//     this.errorStatus = request.ErrorStatus;
//   }
// }

async function apiRequest(path, options = {}) {
  const defaults = {
    headers: {},
    stats: false,
    withAuth: false,
    errors: {
      hide: false
    }
  };

  let tokens = ls.get('setting.auth');

  const stats = options.stats || false;
  options = {
    ...defaults,
    ...options,
    errors: {
      ...defaults.errors,
      ...options.errors
    }
  };

  options.headers['X-API-Key'] = process.env.REACT_APP_BUNGIE_API_KEY;

  if (typeof options.body === 'string') {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  if (tokens && options.withAuth && !options.headers.Authorization) {
    let now = new Date().getTime() + 10000;
    let then = new Date(tokens.access.expires).getTime();

    // console.log('Adding auth');

    // console.log('Auth requested and tokens are available');

    // refresh tokens before making auth-full request
    if (now > then) {
      // console.log("Tokens are stale");
      const refreshRequest = await GetOAuthAccessToken(`grant_type=refresh_token&refresh_token=${tokens.refresh.value}`);

      if (refreshRequest && refreshRequest.ErrorCode !== 1) {
        return await refreshRequest;
      }

      tokens = ls.get('setting.auth');

      options.headers.Authorization = `Bearer ${tokens.access.value}`;
    } else {
      // console.log("Tokens aren't stale");
      options.headers.Authorization = `Bearer ${tokens.access.value}`;
    }
  }

  const request = await fetch(`https://${stats ? 'stats' : 'www'}.bungie.net${path}`, options)
    .catch(e => {
      if (!options.errors.hide) {
        store.dispatch({
          type: 'PUSH_NOTIFICATION',
          payload: {
            error: true,
            date: new Date().toISOString(),
            expiry: 86400000,
            displayProperties: {
              name: `HTTP error`,
              description: `A network error occured. ${e.message}.`,
              timeout: 4
            }
          }
        });
      }
    });
  
  const contentType = request && request.headers.get('content-type');
  const response = request && contentType.indexOf("application/json") !== -1 && await request.json();

  if ((response && response.ErrorCode && response.ErrorCode !== 1) || (response && response.error)) {
    if (!options.errors.hide) {
      store.dispatch({
        type: 'PUSH_NOTIFICATION',
        payload: {
          error: true,
          date: new Date().toISOString(),
          expiry: 86400000,
          displayProperties: {
            name: 'Bungie',
            description: response.ErrorCode ? `${response.ErrorCode} ${response.ErrorStatus}\n\n${response.Message}` : `${response.error}\n\n${response.error_description}`,
            timeout: 4
          }
        }
      });
    }

    if (path === '/Platform/App/OAuth/Token/') {
      console.log(`There was an OAuth token error so I'm going to go ahead and reset your tokens for you.`);

      store.dispatch({
        type: 'RESET_AUTH'
      });
    }

    return response;
  } else if (request && request.ok) {
    if (path === '/Platform/App/OAuth/Token/') {
      let now = new Date().getTime();

      let memberships = await GetMembershipDataForCurrentUser(response.access_token);

      if (memberships && memberships.ErrorCode === 1) {
        const tokens = {
          access: {
            value: response.access_token,
            expires: now + response.expires_in * 1000
          },
          refresh: {
            value: response.refresh_token,
            expires: now + response.refresh_expires_in * 1000
          },
          bnetMembershipId: response.membership_id,
          destinyMemberships: memberships.Response.destinyMemberships
        };

        store.dispatch({
          type: 'SET_AUTH',
          payload: tokens
        });

        return {
          ErrorCode: 1,
          Response: tokens
        };
      } else {
        return false;
      }
    } else {
      return response;
    }
  } else if (request) {
    if (!options.errors.hide) {
      store.dispatch({
        type: 'PUSH_NOTIFICATION',
        payload: {
          error: true,
          date: new Date().toISOString(),
          expiry: 86400000,
          displayProperties: {
            name: `HTTP error`,
            description: `Code ${request.status} A network error occured.`,
            timeout: 4
          }
        }
      });
    }

    return request;
  } else {

    return false;
  }
}

export const GetOAuthAccessToken = async body =>
  apiRequest('/Platform/App/OAuth/Token/', {
    method: 'post',
    headers: {
      Authorization: `Basic ${window.btoa(`${process.env.REACT_APP_BUNGIE_CLIENT_ID}:${process.env.REACT_APP_BUNGIE_CLIENT_SECRET}`)}`
    },
    body
  });

export const GetMembershipDataForCurrentUser = async (access = false) =>
  apiRequest('/Platform/User/GetMembershipsForCurrentUser/', {
    withAuth: true,
    headers: {
      Authorization: access && `Bearer ${access}`
    }
  });
  
export const GetMembershipDataById = async options =>
  apiRequest(`/Platform/User/GetMembershipsById/${options.params.membershipId}/${options.params.membershipType}/`, options);

export const GetProfile = async options =>
  apiRequest(`/Platform/Destiny2/${options.params.membershipType}/Profile/${options.params.membershipId}/?components=${options.params.components}`, options);

export const EquipItem = async body =>
  apiRequest(`/Platform/Destiny2/Actions/Items/EquipItem/`, {
    withAuth: true,
    method: 'post',
    body
  });

export const SetItemLockState = async body =>
  apiRequest(`/Platform/Destiny2/Actions/Items/SetLockState/`, {
    withAuth: true,
    method: 'post',
    body
  });

export const ClaimSeasonPassReward = async body =>
  apiRequest(`/Platform/Destiny2/Actions/Seasons/ClaimReward/`, {
    withAuth: true,
    method: 'post',
    body
  });

export const KickMember = async (groupId, membershipType, membershipId) =>
  apiRequest(`/Platform/GroupV2/${groupId}/Members/${membershipType}/${membershipId}/Kick/`, {
    withAuth: true,
    method: 'post'
  });

export const BanMember = async (groupId, membershipType, membershipId) =>
  apiRequest(`/Platform/GroupV2/${groupId}/Members/${membershipType}/${membershipId}/Ban/`, {
    withAuth: true,
    method: 'post'
  });

export const UnbanMember = async (groupId, membershipType, membershipId) =>
  apiRequest(`/Platform/GroupV2/${groupId}/Members/${membershipType}/${membershipId}/Unban/`, {
    withAuth: true,
    method: 'post'
  });

export const GetPendingMemberships = async groupId =>
  apiRequest(`/Platform/GroupV2/${groupId}/Members/Pending/`, {
    withAuth: true
  });

export const ApprovePendingForList = async (groupId, body) =>
  apiRequest(`/Platform/GroupV2/${groupId}/Members/ApproveList/`, {
    withAuth: true,
    method: 'post',
    body
  });

export const DenyPendingForList = async (groupId, body) =>
  apiRequest(`/Platform/GroupV2/${groupId}/Members/DenyList/`, {
    withAuth: true,
    method: 'post',
    body
  });

export const EditGroupMembership = async (groupId, membershipType, membershipId, memberType) =>
  apiRequest(`/Platform/GroupV2/${groupId}/Members/${membershipType}/${membershipId}/SetMembershipType/${memberType}/`, {
    withAuth: true,
    method: 'post'
  });

export const GetVendor = async (membershipType, membershipId, characterId, vendorHash, components) =>
  apiRequest(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/Vendors/${vendorHash}/?components=${components}`, {
    withAuth: true
  });

export const ReportOffensivePostGameCarnageReportPlayer = async options =>
  apiRequest(`/Platform/Destiny2/Stats/PostGameCarnageReport/${options.params.activityId}/Report/`, {
    ...options,
    withAuth: true,
    method: 'post'
  });

export const manifest = async version => fetch(`https://www.bungie.net${version}`).then(a => a.json());

export const GetDestinyManifest = async options => apiRequest('/Platform/Destiny2/Manifest/', options);

export const GetHistoricalStatsDefinition = async options => apiRequest(`/Platform/Destiny2/Stats/Definition/?lc=${options.params.locale}`, options);

export const GetCommonSettings = async options => apiRequest(`/Platform/Settings/`, options);

export const GetPublicMilestones = async options => apiRequest('/Platform/Destiny2/Milestones/', options);

export const GetLinkedProfiles = async options => apiRequest(`/Platform/Destiny2/-1/Profile/${options.params.membershipId}/LinkedProfiles/`, options);

export const GetGroupsForMember = async options => apiRequest(`/Platform/GroupV2/User/${options.params.membershipType}/${options.params.membershipId}/0/1/`, options);

export const GetGroupByName = async (groupName, groupType = 1) => apiRequest(`/Platform/GroupV2/Name/${encodeURIComponent(groupName)}/${groupType}/`);

export const GetMembersOfGroup = async groupId => apiRequest(`/Platform/GroupV2/${groupId}/Members/`);

export const GetGroup = async groupId => apiRequest(`/Platform/GroupV2/${groupId}/`);

export const GetClanLeaderboards = async (groupId, modes, maxtop = 7, statIds) => apiRequest(`/Platform/Destiny2/Stats/Leaderboards/Clans/${groupId}/?modes=${modes.join(',')}&maxtop=${maxtop}` + (statIds ? `&statid=${statIds.join(',')}` : ''));

export const GetClanWeeklyRewardState = async groupId => apiRequest(`/Platform/Destiny2/Clan/${groupId}/WeeklyRewardState/`);

export const GetHistoricalStats = async (membershipType, membershipId, characterId = '0', groups, modes, periodType) => apiRequest(`/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/?groups=${groups}&modes=${modes}&periodType=${periodType}`);

export const SearchDestinyPlayer = async (membershipType, displayName) => apiRequest(`/Platform/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`);

export const GetActivityHistory = async options => apiRequest(`/Platform/Destiny2/${options.params.membershipType}/Account/${options.params.membershipId}/Character/${options.params.characterId}/Stats/Activities/?page=${options.params.page}${options.params.mode ? `&mode=${options.params.mode}` : ''}&count=${options.params.count}`, options);

export const PGCR = async id => apiRequest(`/Platform/Destiny2/Stats/PostGameCarnageReport/${id}/`, { stats: true });

export const GetTrendingCategories = async () => apiRequest(`/Platform/Trending/Categories/`);

export const GetTrendingEntryDetail = async (trendingEntryType, identifier) => apiRequest(`/Platform/Trending/Details/${trendingEntryType}/${identifier}/`);

export const GetMembershipFromHardLinkedCredential = async options => apiRequest(`/Platform/User/GetMembershipFromHardLinkedCredential/${options.params.crType}/${options.params.credential}/`);