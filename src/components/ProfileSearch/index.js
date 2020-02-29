import React from 'react';
import { debounce } from 'lodash';
import { withTranslation } from 'react-i18next';

import * as ls from '../../utils/localStorage';
import * as bungie from '../../utils/bungie';
import Spinner from '../../components/UI/Spinner';

import './styles.css';

class ProfileSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: false,
      search: '',
      searching: false
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSearchChange = e => {
    this.setState({ search: e.target.value });
    this.searchForPlayers();
  };

  onSearchKeyPress = e => {
    // If they pressed enter, ignore the debounce and search right meow. MEOW, SON.
    if (e.key === 'Enter') this.searchForPlayers.flush();
  };

  // Debounced so that we don't make an API request for every single
  // keypress - only when they stop typing.
  searchForPlayers = debounce(async () => {
    const displayName = this.state.search;

    if (!displayName) return;

    this.setState({ searching: true });

    try {
      const isSteamID64 = displayName.match(/\b\d{17}\b/);
      const response = isSteamID64 ? await bungie.GetMembershipFromHardLinkedCredential({ params: { crType: 'SteamId', credential: displayName } }) : await bungie.SearchDestinyPlayer('-1', displayName);

      const results =
        isSteamID64 && response.ErrorCode === 1
          ? [
              await bungie
                .GetProfile({
                  params: {
                    membershipType: response.Response.membershipType,
                    membershipId: response.Response.membershipId,
                    components: '100'
                  },
                  errors: {
                    hide: false
                  }
                })
                .then(response => {
                  return {
                    displayName: response.Response.profile.data.userInfo.displayName,
                    membershipId: response.Response.profile.data.userInfo.membershipId,
                    membershipType: response.Response.profile.data.userInfo.membershipType
                  };
                })
            ]
          : response.Response;

      if (this.mounted) {
        if (results) {
          this.setState({ results, searching: false });
        } else {
          throw Error();
        }
      }
    } catch (e) {
      // If we get an error here it's usually because somebody is being cheeky
      // (eg entering invalid search data), so log it only.
      console.warn(`Error while searching for ${displayName}: ${e}`);
      
      if (this.mounted) this.setState({ results: false, searching: false });
    }
  }, 500);

  resultsElement() {
    const { results, searching } = this.state;

    if (searching) {
      return null;
    }

    if (results && results.length > 0) {
      return this.props.resultsListItems(results);
    } else if (results) {
      return <li className='no-profiles'>{this.props.t('No profiles found')}</li>;
    }

    return null;
  }

  render() {
    const { t } = this.props;
    const { search, searching } = this.state;

    const history = ls.get('history.profiles') || [];

    return (
      <div className='profile-search'>
        <div className='sub-header'>
          <div>{t('Search for player')}</div>
        </div>
        <div className='form'>
          <div className='field'>
            <input onChange={this.onSearchChange} type='text' placeholder={t('insert gamertag or SteamId64')} spellCheck='false' value={search} onKeyPress={this.onSearchKeyPress} />
          </div>
        </div>

        <div className='results'>{searching ? <Spinner mini /> : <ul className='list'>{this.resultsElement()}</ul>}</div>

        {history.length > 0 && (
          <>
            <div className='sub-header'>
              <div>{t('Previous searches')}</div>
            </div>
            <div className='results'>
              <ul className='list'>{this.props.resultsListItems(history)}</ul>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default withTranslation()(ProfileSearch);
