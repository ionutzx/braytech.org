export function PostMember(payload) {
  try {
    fetch('https://voluspa.braytech.org/enqueue/store', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {}
}

export function PostPatreon(payload) {
  try {
    return fetch('https://voluspa.braytech.org/patreon/set', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(async request => {
      if (request.ok) {
        const response = await request.json();

        return response;
      } else {
        return false;
      }
    });    
  } catch (e) {}
}

export async function GetStatistics() {
  try {
    const request = await fetch('https://voluspa.braytech.org/statistics', {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    return request.Response.data;
  } catch (e) {}
}

export async function GetGearAsset(reference_id) {
  try {
    const request = await fetch(`https://voluspa.braytech.org/manifest/gear-asset/?reference_id=${reference_id}`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (request.ok) {
      const response = await request.json();

      return response;
    } else {
      return false;
    }
  } catch (e) {}
}