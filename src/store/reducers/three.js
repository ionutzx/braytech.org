import * as ls from '../../utils/localStorage';

const lsState = ls.get('setting.three') ? ls.get('setting.three') : {};
const defaultState = {
  debug: false,
  enabled: false,
  shadows: false
};

export default function reducer(state = {...defaultState, ...lsState}, action) {
  switch (action.type) {
    case 'SET_THREE':
      state = {
        ...state,
        ...action.payload
      };

      ls.set('setting.three', state);
      return state;
    default:
      return state;
  }
}
