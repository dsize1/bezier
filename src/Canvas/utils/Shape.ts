import _toPairs from 'lodash/toPairs';
import _reduce from 'lodash/reduce';
import _pick from 'lodash/pick';
import { ShapeType } from '../types';

type Region = {
  x: number;
  y: number;
  w: number;
  h: number;
};
type ChildRegion = {
  cLU: Region;
  cRU: Region;
  cLD: Region;
  cRD: Region;
};

class QuadtreeNode {
  public id: string;
  public parent: QuadtreeNode | null;
  // Child LeftUp , RightUp, LeftDown, RightDown 
  // Right Region or Down Region is (l,r];
  public cLU: QuadtreeNode | null;
  public cRU: QuadtreeNode | null;
  public cLD: QuadtreeNode | null;
  public cRD: QuadtreeNode | null;
  // Previous Sibling, Next Sibling
  public pS: QuadtreeNode | null;
  public nS: QuadtreeNode | null;
  public x: number;
  public y: number;
  public w: number;
  public h: number;

  constructor(
    id: string,
    { x, y, w, h }: Region
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.parent = null;
    this.cLU = null;
    this.cRU = null;
    this.cLD = null;
    this.cRD = null;
    this.pS = null;
    this.nS = null;
  }
};

type MapNode = {
  shape: ShapeType;
  node: QuadtreeNode;
};

export default class Shape {
  private map: Map<string, MapNode>;
  private quadtreeRoot: QuadtreeNode;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.map = new Map<string, MapNode>();
    this.quadtreeRoot = new QuadtreeNode('root', { x: 0, y: 0, w: width, h: height });
    this.width = width;
    this.height = height;
  }

  public clear () {
    this.map.clear();
    this.quadtreeRoot = new QuadtreeNode('root', { x: 0, y: 0, w: this.width, h: this.height });
  }

  public append (id: string, shape: ShapeType) {
    const node = this.addQuadtreeNode(id, shape);
    this.map.set(id, { shape, node });
  }

  public remove (id: string) {
    this.map.delete(id);
  }

  public query (id: string):ShapeType  {
    const { shape } = this.map.get(id);
    return shape;
  }

  public getChildRegion (
    x: number,
    y: number,
    w: number,
    h: number
  ): ChildRegion {
    const leftWidth = Math.round(w / 2);
    const rightWidth = w - leftWidth;
    const upHeight = Math.round(h / 2);
    const downHeight = h - upHeight;
    const midPointX = x + leftWidth;
    const midPointY = y + upHeight;
    const cLU = { x, y, w: leftWidth, h: upHeight };
    const cRU = { x: midPointX, y, w: rightWidth, h: upHeight };
    const cLD = { x, y: midPointY, w: leftWidth, h: downHeight };
    const cRD = { x: midPointX, y: midPointY, w: rightWidth, h: downHeight };
    return { cLU, cRU, cLD, cRD };
  }

  public boxInRegion (box: Region, region: Region, isRightRegion: boolean, isDownRegion: boolean): boolean {
    if (
      box.x < region.x &&
      (isRightRegion || box.x === region.x) &&
      box.y < region.y &&
      (isDownRegion || box.y === region.y) &&
      box.w <= region.w &&
      box.h <= region.h
    ) {
      return true;
    }
    return false;
  }

  public judgeRegion (box: Region, childRegion: ChildRegion): 'nS' | keyof ChildRegion {
    const regions = _toPairs(childRegion) as Array<[keyof ChildRegion, Region]>;
    const { region } = _reduce<[keyof ChildRegion, Region], { region: 'nS' | keyof ChildRegion; isCross: boolean; }>(
      regions,
      (result, [regionKey, region]) => {
        if (result.isCross) return result;
        const isRightRegion = regionKey === 'cRU' || regionKey === 'cRD';
        const isDownRegion = regionKey === 'cLD' || regionKey === 'cRD';
        if (this.boxInRegion(box, region, isRightRegion, isDownRegion)) {
          if (result.region !== 'nS') {
            result.region = 'nS';
            result.isCross = true;
          } else {
            result.region = regionKey;
          }
        }
        return result;
      },
      { region: 'nS', isCross: false }
    );
    return region;
  }

  public addQuadtreeNode (id: string, shape: ShapeType): QuadtreeNode {
    //todo shape box;
    const box = shape.box;
    let quadtreeNode = null;
    let currNode = this.quadtreeRoot;
    while(!quadtreeNode) {
      const x = currNode.x;
      const y = currNode.y;
      const w = currNode.w;
      const h = currNode.h
      const childRegion = this.getChildRegion(x, y, w, h);
      const currRegion = this.judgeRegion(box, childRegion);
      if (currRegion !== 'nS') {
        // todo 添加子节点
        if (currNode[currRegion]) {
          currNode = currNode[currRegion] as QuadtreeNode;
        } else {
          quadtreeNode = new QuadtreeNode(id, childRegion[currRegion]);
          currNode[currRegion] = quadtreeNode;
        }
      } else {
        // todo 考虑绘制顺序是否是在尾部添加
        while (!currNode.nS) {
          currNode = currNode.nS as QuadtreeNode;
        }
        quadtreeNode = new QuadtreeNode(id, { x, y, w, h });
        currNode.nS = quadtreeNode;
      }
    }
    return quadtreeNode;
  }
};
