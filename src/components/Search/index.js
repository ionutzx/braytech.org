import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import dudRecords from '../../data/dudRecords';
import Records from '../Records';
import Collectibles from '../Collectibles';

import './styles.css';

const manifestTables = [
  'DestinyAchievementDefinition',
  'DestinyActivityDefinition',
  'DestinyActivityGraphDefinition',
  'DestinyActivityInteractableDefinition',
  'DestinyActivityModeDefinition',
  'DestinyActivityModifierDefinition',
  'DestinyActivityTypeDefinition',
  'DestinyArtDyeChannelDefinition',
  'DestinyArtDyeReferenceDefinition',
  'DestinyArtifactDefinition',
  'DestinyBondDefinition',
  'DestinyBreakerTypeDefinition',
  'DestinyCharacterCustomizationCategoryDefinition',
  'DestinyCharacterCustomizationOptionDefinition',
  'DestinyChecklistDefinition',
  'DestinyClassDefinition',
  'DestinyCollectibleDefinition',
  'DestinyDamageTypeDefinition',
  'DestinyDestinationDefinition',
  'DestinyEnemyRaceDefinition',
  'DestinyEnergyTypeDefinition',
  'DestinyEntitlementOfferDefinition',
  'DestinyEquipmentSlotDefinition',
  'DestinyFactionDefinition',
  'DestinyGenderDefinition',
  'DestinyHistoricalStatsDefinition',
  'DestinyInventoryBucketDefinition',
  'DestinyInventoryItemDefinition',
  'DestinyInventoryItemLiteDefinition',
  'DestinyItemCategoryDefinition',
  'DestinyItemTierTypeDefinition',
  'DestinyLocationDefinition',
  'DestinyLoreDefinition',
  'DestinyMaterialRequirementSetDefinition',
  'DestinyMedalTierDefinition',
  'DestinyMilestoneDefinition',
  'DestinyNodeStepSummaryDefinition',
  'DestinyObjectiveDefinition',
  'DestinyPlaceDefinition',
  'DestinyPlatformBucketMappingDefinition',
  'DestinyPlugSetDefinition',
  'DestinyPresentationNodeDefinition',
  'DestinyProgressionDefinition',
  'DestinyProgressionLevelRequirementDefinition',
  'DestinyProgressionMappingDefinition',
  'DestinyRaceDefinition',
  'DestinyRecordDefinition',
  'DestinyReportReasonCategoryDefinition',
  'DestinyRewardAdjusterPointerDefinition',
  'DestinyRewardAdjusterProgressionMapDefinition',
  'DestinyRewardItemListDefinition',
  'DestinyRewardMappingDefinition',
  'DestinyRewardSheetDefinition',
  'DestinyRewardSourceDefinition',
  'DestinySackRewardItemListDefinition',
  'DestinySandboxPatternDefinition',
  'DestinySandboxPerkDefinition',
  'DestinySeasonDefinition',
  'DestinySeasonPassDefinition',
  'DestinySocketCategoryDefinition',
  'DestinySocketTypeDefinition',
  'DestinyStatDefinition',
  'DestinyStatGroupDefinition',
  'DestinyTalentGridDefinition',
  'DestinyUnlockCountMappingDefinition',
  'DestinyUnlockDefinition',
  'DestinyUnlockEventDefinition',
  'DestinyUnlockExpressionMappingDefinition',
  'DestinyUnlockValueDefinition',
  'DestinyVendorDefinition',
  'DestinyVendorGroupDefinition',
  'BraytechDefinition',
  'DestinyClanBannerDefinition'
];

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: [],
      search: this.props.initialValue || ''
    };

    this.index = [];
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.results !== this.state.results) {
      this.props.rebindTooltips();
    }
  }

  componentDidMount() {
    const { collectibles, table, database } = this.props;
    
    const tables = table ? [table] : manifestTables;

    tables.forEach(table => {

      const entries = Object.keys(manifest[table]).reduce((index, key) => {
        if (!database && manifest[table][key].redacted) {
          return index;
        }
  
        if (!database && table === 'DestinyRecordDefinition' && collectibles.hideDudRecords && dudRecords.includes(manifest.DestinyRecordDefinition[key]?.hash)) {
          return index;
        }
  
        return [
          ...index,
          {
            table: table,
            hash: manifest[table][key].hash
          }
        ];
      }, []);

      this.index.push(...entries);

    });    

    if (this.props.initialValue) {
      this.performSearch();
    }
  }

  onSearchChange = e => {
    this.setState({ search: e.target.value });

    this.performSearch();
  };

  onSearchKeyPress = e => {
    // If they pressed enter, ignore the debounce and search
    if (e.key === 'Enter') this.performSearch.flush();
  };

  performSearch = debounce((term = this.state.search) => {
    if (!term || term.length < 3) {
      this.setState({ results: [] });
      return;
    }

    console.log(term);

    term = term.toString().toLowerCase();

    // test for filters
    let filters = term.match(/(type|name|description):/);
    filters = filters && filters.length ? filters[1] : false;

    const tableMatch = manifestTables.find(table => table.toLowerCase() === term);

    if (tableMatch) {
      const results = Object.keys(manifest[tableMatch]).map(key => ({
        table: tableMatch,
        hash: manifest[tableMatch][key].hash
      }));

      console.log(results)

      this.setState({ results });

      return;
    }

    let regex = RegExp(term, 'gi');

    const results = this.index.filter(entry => {
      const definition = manifest[entry.table][entry.hash];

      if (!definition) {
        return false;
      }

      if (!this.props.database) {
        const definitionItem = manifest.DestinyInventoryItemDefinition[definition?.itemHash] || false;

        let name = definition?.displayProperties?.name;
        let description = definition?.displayProperties?.description;
        let type = definitionItem?.itemTypeAndTierDisplayName;

        // normalise name, description, and type, removing funny versions of 'e'
        name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        description = description.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        type = type ? definitionItem.itemTypeAndTierDisplayName.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : false;

        if (filters && filters === 'name') {
          regex = RegExp(term.replace('name:', '').trim(), 'gi');

          if (regex.test(name)) {
            return true;
          } else {
            return false;
          }
        } else if (filters && filters === 'description') {
          regex = RegExp(term.replace('description:', '').trim(), 'gi');

          if (regex.test(description)) {
            return true;
          } else {
            return false;
          }
        } else if (type && filters && filters === 'type') {
          regex = RegExp(term.replace('type:', '').trim(), 'gi');

          if (regex.test(type)) {
            return true;
          } else {
            return false;
          }
        } else {
          let concatenated = `${name} ${description}`;

          if (regex.test(concatenated)) {
            return true;
          } else {
            return false;
          }
        }
      } else {
        const root = Object.keys(definition).filter(key => {
          if (regex.test(definition[key])) {
            return key;
          }

          return false;
        });

        const displayProperties = definition.displayProperties && Object.keys(definition.displayProperties).filter(key => {
          if (regex.test(definition.displayProperties[key])) {
            return key;
          }

          return false;
        });

        if (root.length || displayProperties?.length) {
          return true;
        }

        return false;
      }
    });

    console.log(results)

    this.setState({ results });
  }, 500);

  render() {
    const { t, table, database, resultsRenderFunction } = this.props;
    const { results, search } = this.state;

    let display;
    if (!database && table === 'DestinyRecordDefinition') {
      display = (
        <ul className='list record-items'>
          <Records selfLinkFrom='/triumphs' hashes={results.map(e => e.hash)} ordered />
        </ul>
      );
    } else if (!database && table === 'DestinyCollectibleDefinition') {
      display = (
        <ul className='list collection-items'>
          <Collectibles selfLinkFrom='/collections' hashes={results.map(e => e.hash)} ordered />
        </ul>
      );
    } else if (resultsRenderFunction) {
      display = resultsRenderFunction(results);
    } else {
      display = results.join(', ');
    }

    return (
      <div className={cx('index-search', { 'has-results': results.length })}>
        <div className='form'>
          <div className='field'>
            <input onChange={this.onSearchChange} type='text' placeholder={t('enter name or description')} spellCheck='false' value={search} onKeyPress={this.onSearchKeyPress} />
          </div>
        </div>
        {display}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    tooltips: state.tooltips,
    collectibles: state.collectibles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(Search);
