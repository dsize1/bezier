import React from 'react';
import ControlPoints from '../../components/ControlPoints';
import Stage from '../../components/Stage';
import Display from '../../components/Display/index';
import Compare from '../../components/Compare';
import utils from '../../utils';

import styles from './bezier.module.css';

const getCls = utils.getStyleCls(styles);

const Bezier = () => {
  return (
    <main className={getCls('bezier')}>
      <section className={getCls('content')} >
        <Stage className={getCls('display')} />
        <ControlPoints className={getCls('controller')} />
      </section>
      <section className={getCls('preview-current')} >
        <Display />
      </section>
      <section className={getCls('preview-compare')} >
        <Compare />
      </section>
    </main>
  );
}

export default Bezier;
