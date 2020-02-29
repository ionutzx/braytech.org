import * as ls from './localStorage';
import * as bungie from './bungie';
import * as responseUtils from './responseUtils';
import manifest from './manifest';

async function getMember(membershipType, membershipId, silent = false) {

  // https://bungie-net.github.io/multi/schema_Destiny-DestinyComponentType.html
  
  const components = [
    100, // Profiles
    102, // ProfileInventories
    103, // ProfileCurrencies
    104, // ProfileProgression
    200, // Characters
    201, // CharacterInventories
    202, // CharacterProgressions
    204, // CharacterActivities
    205, // CharacterEquipment
    300, // ItemInstances
    301, // ItemObjectives
    302, // ItemPerks
    303, // ItemRenderData
    304, // ItemStats
    305, // ItemSockets
    306, // ItemTalentGrids
    307, // ItemCommonData
    308, // ItemPlugStates
    309, // ItemPlugObjectives
    310, // ItemReusablePlugs
    800, // Collectibles
    900  // Records
  ];

  let withAuth = false;
  
  try {
    const tokens = ls.get('setting.auth');
    const now = new Date().getTime() + 10000;

    const refreshTokenExpired = tokens && now > new Date(tokens.refresh.expires).getTime();

    if (tokens && tokens.destinyMemberships.find(m => m.membershipId === membershipId) && !refreshTokenExpired) {
      if (manifest.settings && !manifest.settings.systems.Authentication.enabled) {
        return;
      };
      
      withAuth = true;
    }
  } catch (e) {
    console.log(e);
  }

  try {
    const requests = [
      bungie.GetProfile({
        params: {
          membershipType,
          membershipId,
          components: components.join(',')
        },
        withAuth,        
        errors: {
          hide: silent
        }
      }), 
      bungie.GetGroupsForMember({
        params: {
          membershipType,
          membershipId
        },
        errors: {
          hide: silent
        }
      }), 
      bungie.GetPublicMilestones({
        errors: {
          hide: true
        }
      })
    ];

    const [profile, groups, milestones] = await Promise.all(requests);
  
    if (profile?.ErrorCode === 1 && profile.Response?.profileProgression?.data && groups?.ErrorCode === 1) {

      return {
        profile: {
          ...profile,
          Response: responseUtils.profileScrubber(profile.Response, 'activity')
        },
        groups: {
          ...profile,
          Response: responseUtils.groupScrubber(groups.Response)
        },
        milestones
      };
    } else {
      
      return {
        profile,
        groups,
        milestones
      };
    }
    
  } catch (e) {
    console.log(e)
    return false;
  }
    
}

export default getMember;
