import { Observable, fromEvent } from 'rxjs';
import { mergeAll, withLatestFrom, zipAll, concatMap, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import _each from 'lodash/each';
import Shapes from './Shapes';
import { Region } from './Shapes';
import { ShapeType, ShapePosition } from '../types';
import Canvas from '../index';

type EventType = 
  'mousedown' | 'mouseup' | 'contextmenu' |
  'mouseenter' | 'mouseleave' | 'mousemove' |
  'click' | 'dblclick'

export interface ICoordinates {
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
    this.observeEvent();
  }

  private observeEvent () {
    const mouseMove$ = fromEvent<MouseEvent>(this.canvasEl, 'mousemove')
      .pipe(

      )
    const mouseDown$ = fromEvent<MouseEvent>(this.canvasEl, 'mousedown');
    const mouseUp$ = fromEvent<MouseEvent>(this.canvasEl, 'mouseup');
    const contextMenu$ = fromEvent<MouseEvent>(this.canvasEl, 'contextmenu');
    const mouseOut$ = fromEvent<MouseEvent>(this.canvasEl, 'mouseout');


    contextMenu$.subscribe(
      (e: MouseEvent) => this.nextHandler(e, 'contextmenu'));

    // click : zip
    // dbl: bufferToggle openings-> the Click , closingSelector-> timer(200)
    // drag: start-> mouseDown, mouseDown.concatMap, stop -> mouseup.merge(isn't shape,mouseout), 
    //    mouseMove.takeUtil(stop$) , map( concat drag event )
  }

  private nextHandler (e: MouseEvent, type: EventType) {
    const coords = this.getCoordsFromEvent(e);
    const clientCoords = this.getClientCoordsFromEvent(e);
    const targetList = this.shapes.getEventTarget(coords);
    console.log('event handler: ', targetList);
    this.dispatch(targetList, type, coords, clientCoords);
  }

  private getCoordsFromEvent (e: MouseEvent) {
    return { x: e.offsetX, y: e.offsetY };
  }

  private getClientCoordsFromEvent (e: MouseEvent) {
    return { x: e.pageX, y: e.pageY };
  }

  private dispatch (
    targetList: Array<ShapeType>,
    type: EventType,
    coords: ICoordinates,
    clientCoords: ICoordinates,
  ) {
    _each(
      targetList,
      (target: ShapeType) => {
        const offset = { x: coords.x - target.x, y: coords.y - target.y };
        target.emit({
          type,
          target,
          timeStamp: Date.now(),
          offset,
          coords,
          clientCoords
        });
      }
    );
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
