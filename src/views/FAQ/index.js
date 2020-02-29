import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

import { ReactComponent as Diagram1 } from '../../svg/miscellaneous/collectible-and-record-diagram.svg';

import './styles.css';

class FAQ extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  handler_scrollTo = id => e => {
    e.preventDefault();

    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: 'smooth' });
  };

  render() {
    const { t } = this.props;

    const qa = [
      {
        k: 'braytech',
        i: 0,
        q: t('Describing the anatomy of collectibles and records'),
        a: [<Markdown key='0' className='markdown' source={t("Commonly asked, \"What is the funny percentage to the right of collectibles and records?\"\n\nIt's a percentage of players who've either discovered or redeemed the item. Every few days, _VOLUSPA_ collects data from users of _Braytech_ and takes note of who's got what.\n\nIt's been a hot topic as to whether it's accurate or useful and the truth is that all statistics are useless and dumb _unless_ you've included every single piece of data possible.\n\nIt's fair to assume that these stats are bias towards casual players (percentages may appear higher rather than lower due to the skill and attention of the users that are monitored).")} />, <Diagram1 key='1' />]
      },
      {
        k: 'braytech-beta',
        i: 1,
        q: t("Braytech Beta won't update to the newest version"),
        a: [<Markdown key='0' className='markdown' source={t("From _Settings_ you can try a variety of things. Start with _Update service worker_. Wait a small time and you should be prompted to restart to update.\n\nIf this fails, you can try _Reload_. If all is lost, _Dump service worker_.\n\n_For the technically inclined, the unpredictable behaviour of service workers—especially on iOS—is why I haven't redeployed one to production after what happened last time._")} />]
      },
      {
        k: 'api',
        i: 2,
        q: t('Something seems wrong with my Valor rank resets'),
        a: [<Markdown key='0' className='markdown' source={t("For Valor rank resets, Braytech only counts resets made in Season 4 (Forsaken release) and later. This aligns the stat with other metrics such as Infamy.\n\nAdditionally, for the most part, triumph records disregard earlier seasons as well. This is a choice I made for Braytech.\n\nIf for some reason your stats don't align with your expectations, there's a likely chance that this is a reflection of the API, not Braytech.")} />]
      },
      {
        k: 'api',
        i: 3,
        q: t("Clan Historical Stats don't match [other thing]"),
        a: [<Markdown key='0' className='markdown' source={t("There are multiple sources for stats in Destiny. Clan Historical Stats is based on the HistoricalStats API endpoint while others source their data from PGCRs. It's hard to determine which holds the most accurate truth.\n\nTo display stats in the manner seen on Clan Historical Stats would require downloading terabytes of data from Bungie servers and significant compute power. This said, they're accurate enough for some friendly competititon.")} />]
      }
    ];

    return (
      <div className='view' id='faq'>
        <div className='module head'>
          <div className='page-header'>
            <div className='name'>{t('Frequently Asked Questions')}</div>
          </div>
        </div>
        <div className='buff'>
          <div className='module overview'>
            <h4>Braytech</h4>
            <ul>
              {qa
                .filter(q => q.k === 'braytech')
                .map((qa, index) => {
                  return (
                    <li key={index} className='qa'>
                      <a className='hyperlink' href='/' onClick={this.handler_scrollTo(qa.i)}>
                        {qa.q}
                      </a>
                    </li>
                  );
                })}
            </ul>
            <h4>Braytech Beta</h4>
            <ul>
              {qa
                .filter(q => q.k === 'braytech-beta')
                .map((qa, index) => {
                  return (
                    <li key={index} className='qa'>
                      <a className='hyperlink' href='/' onClick={this.handler_scrollTo(qa.i)}>
                        {qa.q}
                      </a>
                    </li>
                  );
                })}
            </ul>
            <h4>API</h4>
            <ul>
              {qa
                .filter(q => q.k === 'api')
                .map((qa, index) => {
                  return (
                    <li key={index} className='qa'>
                      <a className='hyperlink' href='/' onClick={this.handler_scrollTo(qa.i)}>
                        {qa.q}
                      </a>
                    </li>
                  );
                })}
            </ul>
          </div>
          <div className='module faq'>
            <div className='k'>
              {qa.map((qa, index) => {
                return (
                  <div key={index} id={qa.i} className='qa'>
                    <div className='q'>{qa.q}</div>
                    <div className='a'>{qa.a}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(connect(), withTranslation())(FAQ);
