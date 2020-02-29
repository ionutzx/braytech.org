import * as ls from '../../utils/localStorage';

const history = ls.get('history.tips') || [];

export default function reducer(state = history, action) {
  switch (action.type) {
    case 'DISMISS_TIP':

      const adjusted = state.concat(action.payload);
      
      ls.set('history.tips', adjusted);

      return adjusted;
    case 'SET_TIPS':      
      ls.set('history.tips', action.payload);

      return action.payload;
    default:
      return state;
  }
}
