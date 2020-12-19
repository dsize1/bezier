import { useState } from 'react';
import { createModel } from 'hox';

export interface IControlPlayer  {
  duration: number;
  run: boolean;
}

function useControlPlayer() {
  const initialPlayer: Readonly<IControlPlayer> = { duration: 1000, run: false };
  const [player, setPlayer] = useState<Readonly<IControlPlayer> >(initialPlayer);
  return {
    initialPlayer,
    player,
    setPlayer
  }
}

export default createModel(useControlPlayer);
