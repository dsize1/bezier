import Shapes from './Shapes';
import { Region } from './Shapes';
import { ShapeType, ShapePosition } from '../types';
import Canvas from '../index';

type EventType = 
  'mousedown' | 'mouseup' | 'contextmenu' |
  'mouseenter' | 'mouseout' | 'mouseover' |
  'mousemove' | 'mouseleave' | 'dblclick' |
  'click';

interface ICoordinates {
  x: number;
  y: number;
}

interface IEvent {
  type: EventType;
  target: ShapeType;
  timeStamp: number;
  offset: ICoordinates;
  coords: ICoordinates;
  clientCoords: ICoordinates;
}

interface EventCallback {
  (event: IEvent): void
}

export class EventBus {

  constructor (readonly canvasEl: HTMLCanvasElement, readonly shapes: Shapes) {
    // canvas add eventlistener: 'mouseMove' 'mousedown' 'mouseup' 'contextmenu';
  }

}

export abstract class BaseShape {
  private listeners: Map<EventType, Set<EventCallback>> | null;

  constructor () {
    this.listeners = new Map<EventType, Set<EventCallback>>();
  }

  public on (type: EventType, callback: EventCallback) {
    let set: Set<EventCallback>;
    if (!this.listeners?.has(type)) {
      set = new Set<EventCallback>();
      this.listeners?.set(type, set);
    } else {
      set = this.listeners?.get(type) as Set<EventCallback>;
    }
    if (!set.has(callback)) set.add(callback);
  }

  off (): void;
  off (type: EventType): void;
  off (type: EventType, callback: EventCallback): void;
  public off (type?: EventType, callback?: EventCallback): void {
    if (!type) {
      this.listeners?.forEach((set: Set<EventCallback>, type: EventType) => {
        set.clear();
      });
      this.listeners?.clear();
      this.listeners = null;
    } else {
      const set = this.listeners?.get(type);
      if (typeof callback !== 'function') {
        set?.clear();
      } else {
        set?.delete(callback);
      }
    }
  }

  public emit (event: IEvent) {
    const type = event.type;
    const set = this.listeners?.get(type);
    set?.forEach((callback: EventCallback) => {
      callback(event);
    });
  }

  abstract setState (nextState: ShapePosition): void;

  abstract resize (
    now: { width: number; height: number; },
    past: { width: number; height: number; }
  ): void;

  abstract getBoundaryBox (): Region;

  abstract draw (canvas: Canvas): void;
}
