import React, { useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import utils from '../../utils'
import useControlPoints from '../../models/controlPoints'
import useControlPlayer from '../../models/controlPlayer'
import { DUE_TIME } from '../Stage/contants';
import styles from './compare.module.css';

const getCls = utils.getStyleCls(styles);

function Compare() {
  const [isTop, setIsTop] = useState(false);
  const { points } = useControlPoints();
  const { player } = useControlPlayer();

  const ballStyle = useMemo(() => {
    const propertyName = 'bottom';
    const duration = player.duration / 1000;
    const cubicBezier = utils.p2CubicBezier(points);
    const delay = DUE_TIME / 1000;
    const transition = `${propertyName} ${duration}s ${cubicBezier} ${delay}s`;
    return { transition };
  }, [points, player.duration]);

  useEffect(() => {
    if (player.run) {
      setIsTop((is) => !is);
    }
  }, [player.run])

  return (
    <div className={getCls('container')}>
      <i
        className={classNames(
          getCls('ball'),
          { [getCls('ball-top')]: isTop }
        )}
        style={ballStyle}
      />
    </div>
  );
}

export default Compare;
