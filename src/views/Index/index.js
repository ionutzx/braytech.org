import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Moment from 'react-moment';

import { t, fromNow } from '../../utils/i18n';
import manifest from '../../utils/manifest';
import MemberLink from '../../components/MemberLink';
import Button from '../../components/UI/Button';

import captainsLog from '../../data/captainsLog';

import { ReactComponent as Patreon } from '../../svg/miscellaneous/patreon-device.svg';
import { ReactComponent as highlightClan } from '../../svg/miscellaneous/highlight-clan.svg';
import { ReactComponent as highlightCollections } from '../../svg/miscellaneous/highlight-collections.svg';
import { ReactComponent as highlightTriumphs } from '../../svg/miscellaneous/highlight-triumphs.svg';
import { ReactComponent as highlightChecklists } from '../../svg/miscellaneous/highlight-checklists.svg';
import { ReactComponent as highlightMaps } from '../../svg/miscellaneous/highlight-maps.svg';
import { ReactComponent as highlightThisWeek } from '../../svg/miscellaneous/highlight-this-week.svg';
import { ReactComponent as highlightQuests } from '../../svg/miscellaneous/highlight-quests.svg';
import { ReactComponent as highlightReports } from '../../svg/miscellaneous/highlight-reports.svg';

import './styles.css';

const highlights = [
  {
    name: t('Clan'),
    desc: t('About your clan, its roster, summative historical stats for all members, and admin mode'),
    slug: '/clan',
    icon: highlightClan
  },
  {
    name: t('Collections'),
    desc: t('Items your Guardian has acquired over their lifetime'),
    slug: '/collections',
    icon: highlightCollections
  },
  {
    name: t('Triumphs'),
    desc: t('Records your Guardian has achieved through their trials'),
    slug: '/triumphs',
    icon: highlightTriumphs
  },
  {
    name: t('Checklists'),
    desc: t('Ghost scans and item checklists spanning the Sol system'),
    slug: '/checklists',
    icon: highlightChecklists
  },
  {
    name: t('Maps'),
    desc: t('Interactive maps charting checklists and other notable destinations'),
    slug: '/maps',
    icon: highlightMaps
  },
  {
    name: t('This Week'),
    desc: t('Noteworthy records and collectibles which are available at a weekly cadence'),
    slug: '/this-week',
    icon: highlightThisWeek
  },
  {
    name: t('Quests'),
    desc: t('Track your pursuits, including quests and bounties'),
    slug: '/quests',
    icon: highlightQuests
  },
  {
    name: t('Reports'),
    desc: t('Explore and filter your Post Game Carnage Reports in detail'),
    slug: '/reports',
    icon: highlightReports
  }
];

class Index extends React.Component {
  state = {
    log: 0
  }

  logs = [...captainsLog].reverse();

  supporters = this.shuffle([...manifest.statistics.patrons.alpha, ...manifest.statistics.patrons.beta.filter(m => manifest.statistics.patrons.alpha.indexOf(m) < 0)]);

  componentDidMount() {
    this.mounted = true;
    
    window.scrollTo(0, 0);    
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  handler_onClickPrevious = e => {
    if (this.state.log + 1 === this.logs.length) {
      return;
    }

    this.setState(p => ({
      log: p.log + 1
    }));
  };

  handler_onClickNext = e => {
    if (this.state.log === 0) {
      return;
    }
    
    this.setState(p => ({
      log: p.log - 1
    }));
  };

  render() {
    
    return (
      <div className='view' id='index'>
        <div className='row header'>
          <div className='wrapper'>
            <div className='large-text'>
              <div className='name'>Braytech</div>
              <div className='description'>
                {t("Welcome. This is Braytech—a fan-built companion app for Bungie's Destiny. Unleash your potential and make Shaxx proud.")}
              </div>
              <Link className='button cta' to='/now'>
                <div className='text'>{t('Select your character')}</div>
                <i className='segoe-uniE0AB' />
              </Link>
            </div>
            <div className='highlights'>
              {highlights.map((h, i) => (
                <div key={i} className='highlight'>
                  <div className='icon'>
                    <h.icon />
                  </div>
                  <div className='text'>
                    <div className='name'>{h.name}</div>
                    <div className='description'>{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='row about'>
          <div className='wrapper'>
            <div className='module'>
              <h3>{t('What is Braytech')}</h3>
              <div className='description'>
                <p>Braytech is a Destiny fan site with many features. The exhaustive list includes but is not limited to; a clan roster with admin mode, collections and triumphs as per the game itself with some extra bells and whistles, a curated “this week” view detailing end-games chases and their conditions, exhaustive checklists with links to maps, post game carnage reports with details on activities and their participants, a pursuits view for bounties and quests which are supplemented with extra curated data, and a bunch of other stuff too.</p>
                <p>Destiny is a game for all Guardians, available in various languages. So is Braytech. It’s beautiful on both desktop computers and smaller touch devices, accessible by anyone from anywhere.</p>
                <p>The name, Braytech, is that which Clovis Bray, one of several of the franchise's fictional entities, designates their consumer products line; weapons, armour, etc. As such, I thought it fitting as a name for what I endeavour to be one of Destiny’s best third party resources.</p>
              </div>
            </div>
            <div className='module'>
              <h3>{t('Who builds it')}</h3>
              <div className='description'>
                <p>An Australian web developer does. Hi, my name's Tom, and I'm addicted to Destiny. Okay, so not addicted—I've had time to build this web site. Truthfully, I'm an avid Destiny enthusiast who needs both an outlet for letting off steam and for developing my web skills further for use in my professional activities.</p>
                <p>Braytech is a stringent exercise in mimicking—and to a small degree, reimagining—Destiny's UI for web and mobile. This has been my first React project, the first time I've heavily used the command line, the first time I've had to use NPM... And it's been super fun and rewarding, most of the time!</p>
              </div>
            </div>
            {manifest.statistics.scrapes?.last?.tracking ? (
              <div className='module stats'>
                <h3>{t('VOLUSPA statistics')}</h3>
                <ReactMarkdown className='description' source={`For the most part, Braytech is a front-end application. Although, beneath lies VOLUSPA, named after of one of _Rasputin's_ subminds. VOLUSPA records user profiles' unique identifiers and regularly collates statistics based upon them. These stats are displayed throughout the app in the form of record and collectible _commonality_—the term I've given the stat that denotes how common an article is amongst players.`} />
                <ul>
                  <li>
                    <div className='value'>{manifest.statistics.scrapes.last.tracking.toLocaleString()}</div>
                    <div className='name'>{t('Tracked players')}</div>
                    <div className='description'>
                      <p>{t('Number of players VOLUSPA is tracking through their activities and accomplishments')}</p>
                    </div>
                  </li>
                  <li>
                    <div className='value'>{manifest.statistics.scrapes.last.season.toLocaleString()}</div>
                    <div className='name'>{t('Played season')}</div>
                    <div className='description'>
                      <p>{t("Number of tracked players who've played this season")}</p>
                    </div>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
        <div className='row patreon'>
          <div className='wrapper'>
            <div className='device'>
              <Patreon />
            </div>
            <div className='module'>
              <h3>{t('How you can help')}</h3>
              <div className='description'>
                <p>Building these beautiful interfaces and fencing with Bungie's APIs takes effort and time. I can only devote so much of it to hobby ventures, which also cost money to keep online. I have a firm stance against ads on web sites as we know them. As such, I prefer to support these projects out of my own pocket and depend on the generosity of my community.</p>
                <p>By supporting me, you can help ensure that I can keep these projects online, as well as help enable me to continue adding cool new features.</p>
              </div>
              <a className='button cta' href='https://www.patreon.com/braytech' target='_blank' rel='noreferrer noopener'>
                <div className='text'>{t('Become a Patron')}</div>
                <i className='segoe-uniE0AB' />
              </a>
            </div>
            <div className='module tags'>
              {this.supporters.map((membershipId, m) => <MemberLink key={m} id={membershipId} hideFlair />)}
            </div>
          </div>
        </div>
        <div className='row changes'>
          <div className='wrapper'>
            <div className='meta'>
              <h3>{t('Change log')}</h3>
              <div className='text'>
                <div className='number'>{this.logs[this.state.log].version}</div>
                <div className='time'>
                  <time title={this.logs[this.state.log].date}>{fromNow(this.logs[this.state.log].date)}</time>
                </div>
              </div>
              <div className='buttons'>
                <Button text={t('Older')} action={this.handler_onClickPrevious} disabled={this.state.log + 1 === this.logs.length ? true : false} />
                <Button text={t('Newer')} action={this.handler_onClickNext} disabled={this.state.log === 0 ? true : false} />
              </div>
            </div>
            <ReactMarkdown className='log-content' source={this.logs[this.state.log].content} />
          </div>
        </div>
      </div>
    );
  }
}

export default Index;
