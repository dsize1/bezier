import React from 'react';
import Quadtree from './pages/Quadtree';
import utils from './utils';
import styles from './app.module.css';

const getCls = utils.getStyleCls(styles);

function App() {
  return (
    <div className={getCls('app')}>
      <Quadtree />
    </div>
  );
}

export default App;
