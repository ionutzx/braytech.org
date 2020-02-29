import * as ls from '../../utils/localStorage';

const saved = ls.get('setting.theme') ? ls.get('setting.theme') : false;
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const initial = saved?.selected ? saved : { selected: prefersDark ? 'dark-mode' : 'light-mode' };

function updateScrollbars(selected) {
  let root = document.documentElement;
  if (selected === 'dark-mode') {
    root.style.setProperty('--scrollbar-track', '#202020');
    root.style.setProperty('--scrollbar-draggy', '#414141');
  } else {
    root.style.setProperty('--scrollbar-track', '#a7a7a7');
    root.style.setProperty('--scrollbar-draggy', '#cacaca');
  }
}

export default function reducer(state = initial, action) {
  switch (action.type) {
    case 'SET_THEME':
      ls.set('setting.theme', {
        selected: action.payload
      });

      updateScrollbars(action.payload);
      
      return {
        selected: action.payload
      };
    default:

      updateScrollbars(state.selected);
      
      return state;
  }
}
