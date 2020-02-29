import manifest from './manifest.js';

export const stamps = [
  {
    hash: 'warmind',
    primary: true,
    icon: 'superintendent',
    classNames: 'opacity-70 superintendent static-loop',
    condition: membershipId => ['4611686018449662397'].indexOf(membershipId) > -1
  },
  {
    hash: 'patron-veteran',
    primary: true,
    icon: 'veteran',
    classNames: 'opacity-60 patron veteran',
    condition: membershipId => manifest.statistics.patrons.alpha.indexOf(membershipId) > -1
  },
  {
    hash: 'patron',
    primary: true,
    icon: 'braytech',
    classNames: 'opacity-60 patron',
    condition: membershipId => manifest.statistics.patrons.beta.indexOf(membershipId) > -1
  }
];

export const primaryFlair = membershipId => stamps.find(stamp => stamp.condition(membershipId));