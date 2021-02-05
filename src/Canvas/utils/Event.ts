import { Observable, fromEvent, merge, timer } from 'rxjs';
import {
  concatMap,
  takeUntil,
  takeWhile,
  skipUntil,
  take,
  map,
  scan,
  tap
} from 'rxjs/operators';
import _isNil from 'lodash/isNil';
import _each from 'lodash/each';
import Shapes from './Shapes';
import { Region } from './Shapes';
import { ShapeType, ShapePosition } from '../types';
import Canvas from '../index';

type EventType = 
  'mousedown' | 'mouseup' | 'contextmenu' |
  'mouseenter' | 'mouseleave' | 'mousemove' |
  'click' | 'dblclick' | 'drag'

export interface ICoordinates {
  x: number;
  y: number;
}

export interface IEvent {
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

enum CoordsX {
  offset = 'offsetX',
  client = 'clientX',
}

enum CoordsY {
  offset = 'offsetY',
  client = 'clientY',
}

type CoordsStrings = keyof typeof CoordsX;

export class EventBus {

  constructor (readonly canvasEl: HTMLCanvasElement, readonly shapes: Shapes) {
    this.observeEvent();
  }

  private observeEvent () {
    const contextMenu$ = fromEvent<MouseEvent>(this.canvasEl, 'contextmenu');
    this.fromContextMenuEvent(contextMenu$);

    const mouseDown$ = fromEvent<MouseEvent>(this.canvasEl, 'mousedown')
      .pipe(
        tap((e: MouseEvent) => this.handler(e, 'mousedown'))
      );

    const mouseUp$ = fromEvent<MouseEvent>(this.canvasEl, 'mouseup')
      .pipe(
        tap((e: MouseEvent) => this.handler(e, 'mouseup'))
      );
    this.fromClickEvent(mouseDown$, mouseUp$);
    this.fromDoubleClickEvent(mouseDown$, mouseUp$);

    const mouseMove$ = fromEvent<MouseEvent>(this.canvasEl, 'mousemove');
    this.fromMouseMoveEvent(mouseMove$);

    const mouseOut$ = fromEvent<MouseEvent>(this.canvasEl, 'mouseout');
    this.fromDragEvent(mouseDown$, mouseUp$, mouseMove$, mouseOut$);
  }

  private fromContextMenuEvent (contextMenu$: Observable<MouseEvent>) {
    contextMenu$
      .subscribe(
        (e: MouseEvent) => this.handler(e, 'contextmenu')
      );
  }

  private fromClickEvent (mouseDown$: Observable<MouseEvent>, mouseUp$: Observable<MouseEvent>) {
    mouseDown$.pipe(
      concatMap(
        (startEvent) => {
          const startEventCoords = this.getCoords(startEvent, 'offset');
          const startEventTarget = this.shapes.getEventTarget(startEventCoords);
          const startX = startEvent.clientX;
          const startY = startEvent.clientY;

          const stop$ = timer(200);
          return mouseUp$.pipe(
            take(1),
            takeUntil(stop$),
            map<MouseEvent, IEvent | null>(
              (endEvent) => {
                const endEventCoords = this.getCoords(endEvent, 'offset');
                const endEventTarget = this.shapes.getEventTarget(endEventCoords);
                const endX = endEvent.clientX;
                const endY = endEvent.clientY;
                if (
                  Math.abs(startX - endX) > 2 ||
                  Math.abs(startY - endY) > 2 ||
                  _isNil(startEventTarget) ||
                  _isNil(endEventTarget) ||
                  startEventTarget !== endEventTarget
                ) {
                  return null;
                }
                return {
                  target: endEventTarget,
                  type: 'click',
                  coords: endEventCoords,
                  clientCoords: this.getCoords(endEvent, 'client'),
                  offset: { x: endEventCoords.x - endEventTarget.x, y: endEventCoords.y - endEventTarget.y },
                  timeStamp: endEvent.timeStamp
                };
              }
            )
          );
        }
      )
    )
      .subscribe((event: IEvent | null) => {
        if (!_isNil(event)) {
          event.target.emit(event);
        }
      });
  }

  private fromDoubleClickEvent (mouseDown$: Observable<MouseEvent>, mouseUp$: Observable<MouseEvent>) {
    mouseDown$.pipe(
      concatMap((startEvent) => {
        const startEventCoords = this.getCoords(startEvent, 'offset');
        const startEventTarget = this.shapes.getEventTarget(startEventCoords);
        const startX = startEvent.clientX;
        const startY = startEvent.clientY;

        const stop$ = timer(400);
        return mouseUp$.pipe(
          take(2),
          takeUntil(stop$),
          scan<MouseEvent, { count: number, event: IEvent | null }>(
            (acc, clickEvent) => {
              const clickEventCoords = this.getCoords(clickEvent, 'offset');
              const clickEventTarget = this.shapes.getEventTarget(clickEventCoords);
              const endX = clickEvent.clientX;
              const endY = clickEvent.clientY;
              if (
                Math.abs(startX - endX) > 2 ||
                Math.abs(startY - endY) > 2 ||
                _isNil(startEventTarget) ||
                _isNil(clickEventTarget) ||
                startEventTarget !== clickEventTarget
              ) {
                return acc;
              }
              acc.count += 1;
              if (acc.count === 2) {
                acc.event = {
                  target: clickEventTarget,
                  type: 'dblclick',
                  coords: clickEventCoords,
                  clientCoords: this.getCoords(clickEvent, 'client'),
                  offset: { x: clickEventCoords.x - clickEventTarget.x, y: clickEventCoords.y - clickEventTarget.y },
                  timeStamp: clickEvent.timeStamp
                };
              }
              return acc;
            },
            { count: 0, event: null }
          )
        );
      })
    )
      .subscribe(({ event }: { count: number, event: IEvent | null }) => {
        if (!_isNil(event)) {
          event.target.emit(event);
        }
      });
  }

  private fromMouseMoveEvent (mouseMove$: Observable<MouseEvent>) {
    mouseMove$.pipe(
      scan<MouseEvent, { events: Array<{ e: MouseEvent; type: EventType; target: ShapeType  }>, prevTarget: null | ShapeType }>(
        (acc, event) => {
          acc.events = [];
          const prevTarget = acc.prevTarget;
          const coords = this.getCoords(event, 'offset');
          const currTarget = this.shapes.getEventTarget(coords);
          acc.prevTarget = currTarget;
          if (_isNil(currTarget) && !_isNil(prevTarget)) {
            acc.events.push({ e: event, type: 'mouseleave', target: prevTarget });
          } else if(!_isNil(currTarget) && !_isNil(prevTarget)) {
            if (currTarget === prevTarget) {
              acc.events.push({ e: event, type: 'mousemove', target: currTarget });
            } else {
              acc.events.push({ e: event, type: 'mouseleave', target: prevTarget });
              acc.events.push({ e: event, type: 'mouseenter', target: currTarget });
            }
          } else if (!_isNil(currTarget) && _isNil(prevTarget)) {
            acc.events.push({ e: event, type: 'mouseenter', target: currTarget });
          }

          return acc;
        },
        { events: [], prevTarget: null }
      )
    )
      .subscribe(
        ({ events } :{ events: Array<{ e: MouseEvent; type: EventType; target: ShapeType  }>, prevTarget: null | ShapeType }) => {
          _each(
            events,
            ({ e, type, target }) => {
              const coords = this.getCoords(e, 'offset');
              target.emit({
                target,
                type,
                coords,
                clientCoords: this.getCoords(e, 'client'),
                offset: { x: coords.x - target.x, y: coords.y - target.y },
                timeStamp: e.timeStamp
              });
            }
          )
        }
      );
  }

  private fromDragEvent (
    mouseDown$: Observable<MouseEvent>,
    mouseUp$: Observable<MouseEvent>,
    mouseMove$: Observable<MouseEvent>,
    mouseOut$: Observable<MouseEvent>
  ) {
    mouseDown$.pipe(
      concatMap(
        (startEvent) => {
          const startEventCoords = this.getCoords(startEvent, 'offset');
          const startEventTarget = this.shapes.getEventTarget(startEventCoords);
          const stop$ = merge(
            mouseUp$,
            mouseOut$
          );

          return mouseMove$.pipe(
            takeUntil(stop$),
            skipUntil(timer(200)),
            map((moveEvent) => {
              const moveX = moveEvent.clientX - startEvent.clientX;
              const moveY = moveEvent.clientY - startEvent.clientY;
              const moveEventCoords = this.getCoords(moveEvent, 'offset');
              const moveEventTarget = this.shapes.getEventTarget(moveEventCoords);
              const isMoveOut =
                _isNil(moveEventTarget) ||
                _isNil(startEventTarget) ||
                moveEventTarget !== startEventTarget;
              return { event: moveEvent, isMoveOut, target: moveEventTarget, moveX, moveY };
            }),
            takeWhile(
              ({ isMoveOut }) => !isMoveOut
            )
          );
        }
      )
    )
      .subscribe(({ event, target, moveX, moveY }) => {
        if (target) {
          const coords = this.getCoords(event, 'offset');
          const clientCoords = this.getCoords(event, 'client');
          const offset = { x: moveX, y: moveY };
          const timeStamp = event.timeStamp;
          const type = 'drag';
          target.emit({ target, type, coords, clientCoords, offset, timeStamp });
        }
      });
  }

  private handler (e: MouseEvent, type: EventType) {
    const coords = this.getCoords(e, 'offset');
    const clientCoords = this.getCoords(e, 'client');
    const target = this.shapes.getEventTarget(coords);
    if (target) {
      const offset = { x: coords.x - target.x, y: coords.y - target.y };
      const timeStamp = e.timeStamp;
      target.emit({ target, type, coords, clientCoords, offset, timeStamp });
    }
  }

  private getCoords (e: MouseEvent, coordsType: CoordsStrings) {
    const coordsX = CoordsX[coordsType];
    const coordsY = CoordsY[coordsType];;
    return { x: e[coordsX], y: e[coordsY] };
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
