import { useState } from 'react';
import { createModel } from 'hox';

export interface IControlPlayer  {
  run: boolean;
}

function useControlPlayer() {
  const initialPlayer: Readonly<IControlPlayer> = { run: false };
  const [player, setPlayer] = useState<Readonly<IControlPlayer> >(initialPlayer);
  return {
    initialPlayer,
    player,
    setPlayer
  }
}

export default createModel(useControlPlayer);
