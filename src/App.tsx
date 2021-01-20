import React from 'react';

import utils from './utils';

import styles from './app.module.css';

const getCls = utils.getStyleCls(styles);

function App() {
  return (
    <div className={getCls('app')}>
    </div>
  );
}

export default App;
