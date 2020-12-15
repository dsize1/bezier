import React from 'react';
import { Layout } from 'antd';
import ControlPoints from './components/ControlPoints';
import Stage from './components/Stage';
import utils from './utils';

import styles from './App.module.css';

const getCls = utils.getStyleCls(styles);

const { Header, Content } = Layout;

function App() {
  return (
    <Layout className={getCls('app')}>
      <Header className={getCls('header')}>
        <ControlPoints />
      </Header>
      <Content className={getCls('content')}>
        <section className={getCls('display')} >
          <Stage width={800} height={600} />
        </section>
        <section className={getCls('preview-current')} >
        </section>
        <section className={getCls('preview-compare')} >
        </section>
      </Content>
    </Layout>
  );
}

export default App;
