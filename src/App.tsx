import React from 'react';
import ControlPoints from './components/ControlPoints';
import Stage from './components/Stage';
import utils from './utils';

import styles from './App.module.css';

const getCls = utils.getStyleCls(styles);

function App() {
  return (
    <main className={getCls('app')}>
        <section className={getCls('content')} >
          <Stage className={getCls('display')} />
          <ControlPoints className={getCls('controller')} />
        </section>
        <section className={getCls('preview-current')} >
        </section>
        <section className={getCls('preview-compare')} >
        </section>
    </main>
  );
}

export default App;
