import React from 'react';

import dudRecords from '../../../data/dudRecords';
import Records from '../../../components/Records';

class DudDebug extends React.Component {
  render() {
    return (
      <>
        <div className='dud-debug'>
          <ul className='list record-items'>
            <Records hashes={dudRecords} forceDisplay />
          </ul>
        </div>
      </>
    );
  }
}

export default DudDebug;
