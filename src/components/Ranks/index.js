import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import * as utils from '../../utils/destinyUtils';
import ProgressBar from '../UI/ProgressBar';

import { ReactComponent as RankInfamy } from '../../svg/miscellaneous/rank-infamy-colour.svg';
import { ReactComponent as RankValor } from '../../svg/miscellaneous/rank-valor-colour.svg';
import { ReactComponent as RankGlory } from '../../svg/miscellaneous/rank-glory-colour.svg';

import './styles.css';

const icons = {
  2772425241: <RankInfamy />,
  2626549951: <RankValor />,
  2000925172: <RankGlory />
};

class Mode extends React.Component {
  render() {
    const { t, hash } = this.props;
    const { characterId, characterProgressions, characterRecords, profileRecords } = this.props.data;

    const extras = {
      2772425241: {
        // infamy
        class: 'infamy',
        totalPoints: utils.totalInfamy(),
        streakHash: 2939151659
      },
      2626549951: {
        // valor
        class: 'valor',
        totalPoints: utils.totalValor(),
        streakHash: 2203850209
      },
      2000925172: {
        // glory
        class: 'glory',
        totalPoints: utils.totalGlory(),
        streakHash: 2572719399
      }
    };

    let progressStepDescription = characterProgressions[characterId].progressions[hash].currentProgress === extras[hash].totalPoints && characterProgressions[characterId].progressions[hash].stepIndex === manifest.DestinyProgressionDefinition[hash].steps.length ? manifest.DestinyProgressionDefinition[hash].steps[0].stepName : manifest.DestinyProgressionDefinition[hash].steps[(characterProgressions[characterId].progressions[hash].stepIndex + 1) % manifest.DestinyProgressionDefinition[hash].steps.length].stepName;

    let progressStepDescription_split = progressStepDescription.split(' ');

    if (progressStepDescription_split.length === 2) {
      progressStepDescription =
        progressStepDescription_split[0]
          .toLowerCase()
          .split(' ')
          .map(s => s.charAt(0).toUpperCase() + s.substring(1))
          .join(' ') +
        ' ' +
        progressStepDescription_split[1];
    }

    const { resetsTotal, resetsSeason } = utils.calculateResets(hash, characterId, characterProgressions, characterRecords, profileRecords);

    return (
      <div className={cx('rank', extras[hash].class)}>
        <div className='display'>
          <div className='icon'>{icons[hash]}</div>
          <div className='name'>{manifest.DestinyProgressionDefinition[hash].displayProperties.name.replace('Rank','')}</div>
        </div>
        <div className='progress'>
          <ProgressBar
            classNames='step'
            objectiveHash={hash}
            description={progressStepDescription}
            progress={characterProgressions[characterId].progressions[hash].progressToNextLevel}
            completionValue={characterProgressions[characterId].progressions[hash].nextLevelAt}
            hideCheck
          />
          <ProgressBar
            classNames='total'
            objectiveHash={hash}
            description={t('Points')}
            progress={characterProgressions[characterId].progressions[hash].currentProgress}
            completionValue={extras[hash].totalPoints}
            hideCheck
          />
          <div className='data'>
            <ul>
              <li>
                <ul>
                  <li>{t('Win streak')}</li>
                  <li>{characterProgressions[characterId].progressions[extras[hash].streakHash].stepIndex}</li>
                </ul>
              </li>
              {hash !== 2000925172 ? (
                <>
                  <li className='tooltip' data-hash='total_resets' data-type='braytech'>
                    <ul>
                      <li>{t('Total resets')}</li>
                      <li>{resetsTotal}</li>
                    </ul>
                  </li>
                  <li>
                    <ul>
                      <li>{t('Season resets')}</li>
                      <li>{resetsSeason}</li>
                    </ul>
                  </li>
                </>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(connect(mapStateToProps), withTranslation())(Mode);
