import Dexie from 'dexie';

const db = new Dexie('Braytech');

db.version(1).stores({
  manifest: 'table,definitions,version'
});

export default db;
