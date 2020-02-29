const defaultState = {
  loading: false
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case 'SET_REFRESH_STATE':

      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}
