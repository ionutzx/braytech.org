import React from 'react';
import i18next from 'i18next';
import backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';

import * as ls from './localStorage';

let _defaultLanguage = 'en';
let _currentLanguage;

function getCurrentLanguage() {
  if (_currentLanguage) return _currentLanguage;
  _currentLanguage = ls.get('setting.language');
  return _currentLanguage || _defaultLanguage;
}

function setCurrentLanguage(lang) {
  _currentLanguage = lang;
  ls.set('setting.language', lang);
}

i18next
  .use(backend)
  .use(initReactI18next)
  .init({
    lng: getCurrentLanguage(),
    fallbackLng: _defaultLanguage,

    backend: {
      loadPath: '/static/locales/{{lng}}/{{ns}}.json'
    },

    // allow keys to be phrases having `:`, `.`
    nsSeparator: false,
    keySeparator: false,

    interpolation: {
      escapeValue: false,
      format: function(value, format, lng) {
        // if (format === 'bold') return <strong>{value}</strong>;
      }
    },
    react: {
      wait: true,
      useSuspense: false
    }
  });

i18next.getCurrentLanguage = getCurrentLanguage;
i18next.setCurrentLanguage = setCurrentLanguage;

export default i18next;

export const t = (key, options) => i18next.t(key, options || { skipInterpolation: true });

const durationKeys = {
  days: {
    single: t('1 Day'),
    plural: days => t('{{days}} Days', { days })
  },
  hours: {
    single: t('1 Hour'),
    plural: hours => t('{{hours}} Hours', { hours })
  },
  minutes: {
    single: t('1 Minute'),
    plural: minutes => t('{{minutes}} Minutes', { minutes })
  },
  seconds: {
    single: t('1 Second'),
    plural: seconds => t('{{seconds}} Seconds', { seconds })
  }
};

const durationKeysAbr = {
  days: {
    single: t('1 Day'),
    plural: days => t('{{days}} Days', { days })
  },
  hours: {
    single: t('1 Hr'),
    plural: hours => t('{{hours}} Hrs', { hours })
  },
  minutes: {
    single: t('1 Min'),
    plural: minutes => t('{{minutes}} Mins', { minutes })
  },
  seconds: {
    single: t('1 Sec'),
    plural: seconds => t('{{seconds}} Secs', { seconds })
  }
};

function finalString(value) {
  return value.toLocaleString();
}

export const duration = ({ days = 0, hours = 0, minutes = 0, seconds = 0 }, { unit = undefined, relative = false, abbreviated = false } = {}) => {
  const string = [];

  const keys = abbreviated ? durationKeysAbr : durationKeys;

  if (relative) {
    if (days > 0) {
      string.push(days === 1 ? keys.days.single : keys.days.plural(finalString(days)));

      return string.join(' ');
    } else if (days < 1 && hours > 0) {
      string.push(hours === 1 ? keys.hours.single : keys.hours.plural(finalString(hours)));

      return string.join(' ');
    } else if (days < 1 && hours < 1 && minutes > 0) {
      string.push(minutes === 1 ? keys.minutes.single : keys.minutes.plural(finalString(minutes)));

      return string.join(' ');
    } else {
      string.push(seconds === 1 ? keys.seconds.single : keys.seconds.plural(finalString(seconds)));

      return string.join(' ');
    }
  }

  if (unit === 'days') {
    string.push(days === 1 ? keys.days.single : keys.days.plural(finalString(days)));

    return string.join(' ');
  }

  if (unit === 'hours') {
    string.push(hours === 1 ? keys.hours.single : keys.hours.plural(finalString(hours)));

    return string.join(' ');
  }

  if (unit === 'minutes') {
    string.push(minutes === 1 ? keys.minutes.single : keys.minutes.plural(finalString(minutes)));

    return string.join(' ');
  }

  if (days > 0) {
    string.push(days === 1 ? keys.days.single : keys.days.plural(finalString(days)));
    if (hours > 0) string.push(hours === 1 ? keys.hours.single : keys.hours.plural(finalString(hours)));
  }

  if (days < 1 && hours > 0) {
    string.push(hours === 1 ? keys.hours.single : keys.hours.plural(finalString(hours)));
    if (minutes > 0) string.push(minutes === 1 ? keys.minutes.single : keys.minutes.plural(finalString(minutes)));
  }

  if (days < 1 && hours < 1 && minutes > 0) {
    string.push(minutes === 1 ? keys.minutes.single : keys.minutes.plural(finalString(minutes)));
    if (seconds > 0) string.push(seconds === 1 ? keys.seconds.single : keys.seconds.plural(finalString(seconds)));
  }

  if (days < 1 && hours < 1 && minutes < 1) {
    string.push(seconds === 1 ? keys.seconds.single : keys.seconds.plural(finalString(seconds)));
  }

  return string.join(' ');
};

export const timestampToDuration = (timestamp, start = moment()) => {
  const end = moment(timestamp);
  const duration = moment.duration(end.diff(start));

  return {
    years: duration.get('years'),
    months: duration.get('months'),
    days: duration.get('days'),
    hours: duration.get('hours'),
    minutes: duration.get('minutes'),
    seconds: duration.get('seconds'),
    milliseconds: duration.get('milliseconds')
  };
};

export const fromNow = (timestamp, abbreviated = false) => {
  if (abbreviated) {
    return moment(timestamp)
      .locale('rel-abr')
      .fromNow();
  } else {
    return moment(timestamp)
      .locale(['zh-chs', 'zh-cht'].indexOf(i18next.language) > -1 ? 'zh-cn' : i18next.language)
      .fromNow();
  }
};
