import React from 'react';
import { connect } from 'react-redux';
import { orderBy } from 'lodash';
import cx from 'classnames';

import { t } from '../../utils/i18n';
import manifest from '../../utils/manifest';
import dudRecords from '../../data/dudRecords';
import { enumerateRecordState } from '../../utils/destinyEnums';
import { ProfileLink } from '../../components/ProfileLink';
import Records from '../Records';

class RecordsAlmost extends React.Component {
  constructor(props) {
    super(props);

    this.scrollToRecordRef = React.createRef();
  }

  render() {
    const { member, collectibles, sort, limit } = this.props;
    const characterRecords = member && member.data.profile.characterRecords.data;
    const profileRecords = member && member.data.profile.profileRecords.data.records;

    let almost = [];
    const ignores = [];

    // ignore collections badges
    manifest.DestinyPresentationNodeDefinition[manifest.settings.destiny2CoreSettings.badgesRootNode].children.presentationNodes.forEach(child => {
      ignores.push(manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash].completionRecordHash);
      manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash].children.presentationNodes.forEach(subchild => {
        ignores.push(manifest.DestinyPresentationNodeDefinition[subchild.presentationNodeHash].completionRecordHash);
      });
    });

    // ignore MMXIX bullshit
    manifest.DestinyPresentationNodeDefinition[1002334440].children.records.forEach(record => {
      ignores.push(record.recordHash)
    });

    const records = {
      ...profileRecords,
      ...characterRecords[member.characterId].records
    };

    Object.entries(records).forEach(([key, record]) => {
      const hash = parseInt(key, 10);

      if (collectibles.hideDudRecords && dudRecords.indexOf(hash) > -1) {
        return;
      }

      if (manifest.DestinyRecordDefinition[hash].redacted) {
        return;
      }

      if (ignores.includes(hash)) {
        return;
      }

      if (enumerateRecordState(record.state).invisible || enumerateRecordState(record.state).recordRedeemed) {
        return;
      }

      let completionValueDiviser = 0;
      let progressValueDecimal = 0;

      if (record.intervalObjectives) {
        const nextIncomplete = record.intervalObjectives.find(o => !o.complete);

        if (!nextIncomplete) return;

        completionValueDiviser += 1;
        progressValueDecimal += Math.min(nextIncomplete.progress / nextIncomplete.completionValue, 1);
      } else if (record.objectives) {
        record.objectives.forEach(objective => {
          completionValueDiviser += 1;
          progressValueDecimal += Math.min(objective.progress / objective.completionValue, 1);
        });
      } else {
        return;
      }

      const distance = progressValueDecimal / completionValueDiviser;

      if (distance >= completionValueDiviser) {
        return;
      }

      let selfLinkFrom = this.props.selfLinkFrom || false;

      let definitionRecord = manifest.DestinyRecordDefinition[hash] || false;
      let score = 0;

      if (definitionRecord && definitionRecord.completionInfo) {
        score = definitionRecord.completionInfo.ScoreValue;
      }

      // if (hash === 452100546) console.log(definitionRecord.displayProperties.name, distance, progressValueDecimal, completionValueDiviser)

      almost.push({
        distance,
        score,
        commonality: manifest.statistics.triumphs?.[definitionRecord.hash] || 0,
        element: <Records key={hash} selfLink selfLinkFrom={selfLinkFrom} hashes={[hash]} />
      });
    });

    if (sort === 1) {
      almost = orderBy(almost, [record => record.score, record => record.distance], ['desc', 'desc']);
    } else if (sort === 2) {
      almost = orderBy(almost, [record => record.commonality, record => record.distance], ['desc', 'desc']);
    } else {
      almost = orderBy(almost, [record => record.distance, record => record.score], ['desc', 'desc']);
    }

    almost = limit ? almost.slice(0, limit) : almost;

    return (
      <>
        <ul className={cx('list record-items')}>{almost.map(r => r.element)}</ul>
        {this.props.pageLink ? (
          <ProfileLink className='button cta' to={{ pathname: '/triumphs/almost-complete', state: { from: '/triumphs' } }}>
            <div className='text'>{t('See next {{limit}}', { limit: 200 })}</div>
            <i className='segoe-uniE0AB' />
          </ProfileLink>
        ) : null}
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    collectibles: state.collectibles
  };
}

export default connect(mapStateToProps)(RecordsAlmost);
