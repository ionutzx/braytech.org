import Dexie from 'dexie';

import * as ls from './localStorage';
import dexie from './dexie';

export default function runOnceTasks() {

  const history = ls.get('history.tasks') || [];

  if (!history.find(t => t.id === 'resetlang_august192019')) {
    if (ls.get('setting.language') === 'en-au') ls.set('setting.language', 'en');

    ls.update('history.tasks', { id: 'resetlang_august192019' });
  }

  if (!history.find(t => t.id === 'reauth_november042019')) {
    ls.del('setting.auth');

    ls.update('history.tasks', { id: 'reauth_november042019' });
  }

  if (!history.find(t => t.id === 'manifest_november172019')) {
    dexie.table('manifest').clear()

    ls.update('history.tasks', { id: 'manifest_november172019' });
  }

  if (!history.find(t => t.id === 'manifest_november172019-2')) {
    Dexie.delete('braytech');

    ls.update('history.tasks', { id: 'manifest_november172019-2' });
  }

  if (!history.find(t => t.id === 'resetLayoutsBETA_november302019')) {
    ls.del('setting.layouts');

    ls.update('history.tasks', { id: 'resetLayoutsBETA_november302019' });
  }

  if (!history.find(t => t.id === 'adjustLayouts_february032020')) {

    ls.set('setting.layouts', JSON.parse(JSON.stringify(ls.get('setting.layouts')).replace(/SeasonalArtifact/g, 'SeasonArtifact')));

    ls.update('history.tasks', { id: 'adjustLayouts_february032020' });
  }

  if (!history.find(t => t.id === 'adjustLayouts_february082020')) {

    ls.set('setting.layouts', JSON.parse(JSON.stringify(ls.get('setting.layouts')).replace(/HeroicStoryMissions/g, 'DailyHeroicStoryMissions')));

    ls.update('history.tasks', { id: 'adjustLayouts_february082020' });
  }

  if (!history.find(t => t.id === 'adjustLayouts_february152020')) {
    ls.del('setting.layouts');

    ls.update('history.tasks', { id: 'adjustLayouts_february152020' });
  }

}