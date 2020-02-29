import { createStore, combineReducers } from 'redux';

import viewport from './reducers/viewport.js';
import theme from './reducers/theme.js';
import tips from './reducers/tips.js';
import auth from './reducers/auth.js';
import member from './reducers/member.js';
import groupMembers from './reducers/groupMembers.js';
import refresh from './reducers/refresh.js';
import notifications from './reducers/notifications.js';
import pgcr from './reducers/pgcr.js';
import tooltips from './reducers/tooltips.js';
import triumphs from './reducers/triumphs.js';
import collectibles from './reducers/collectibles.js';
import maps from './reducers/maps.js';
import layouts from './reducers/layouts.js';
import three from './reducers/three.js';

const rootReducer = combineReducers({
  viewport,
  theme,
  tips,
  auth,
  member,
  groupMembers,
  refresh,
  notifications,
  pgcr,
  tooltips,
  triumphs,
  collectibles,
  maps,
  layouts,
  three
});

const store = createStore(
  rootReducer,
  // window.__REDUX_DEVTOOLS_EXTENSION__ &&
  //   window.__REDUX_DEVTOOLS_EXTENSION__({
  //     actionsBlacklist: ['PGCR_LOADED', 'PGCR_LOADING'],
  //     trace: true
  //   })
);

export default store;
