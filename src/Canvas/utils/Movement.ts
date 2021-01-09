import { ShapePosition, ShapePositionKey, IMovementState } from '../types';

export default class Movement {
  private state: Map<string, ShapePosition> | null;

  constructor() {
    this.state = new Map<string, ShapePosition>();
  }

  private set (id: string, state: ShapePosition) {
    this.state?.set(id, state);
  }

  private get (id: string) {
    return this.state?.get(id);
  }

  public setState (id: string, key: ShapePositionKey, value: number) {
    const prevState = this.get(id);
    const state = {
      ...prevState,
      [key]: value
    };
    this.set(id, state);
  }

  public getState () {
    const movementState: Array<IMovementState> = [];
    this.state?.forEach(
      (state, id) => {
        movementState.push({ id, state });
      }
    );
    return movementState;
  }

  public clear () {
    this.state?.clear();
    this.state = null;
  }
};
