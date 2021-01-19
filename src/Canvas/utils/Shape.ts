import _toPairs from 'lodash/toPairs';
import _reduce from 'lodash/reduce';
import _pick from 'lodash/pick';
import _findIndex from 'lodash/findIndex';
import _has from 'lodash/has';
import _each from 'lodash/each';
import _sortBy from 'lodash/sortBy';
import { ShapeType } from '../types';

const MAX_TREE_LEVELS = 7;
const MAX_Node_SIZE = 4;

type Region = {
  x: number;
  y: number;
  w: number;
  h: number;
};

class QuadtreeNode {
  public units: { [id: string]: ShapeType; };
  public size: number;
  public isLeaf: boolean;
  public level: number;
  public x: number;
  public y: number;
  public w: number;
  public h: number;

  constructor({ x, y, w, h }: Region, level: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.units = {};
    this.size = 0;
    this.isLeaf = true;
    this.level = level;
  }

  public init({ x, y, w, h }: Region, level: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.units = {};
    this.size = 0;
    this.isLeaf = true;
    this.level = level;
  }

  public add (id: string, shape: ShapeType): number {
    this.units[id] = shape;
    this.size += 1;
    return this.size;
  }

  public del (id: string): number {
    if (_has(this.units, id)) {
      const { [id]: deleted, ...rest } = this.units;
      this.units = rest;
      this.size -= 1;
    }
    return this.size;
  }

  public clear (): Array<[id: string, shape: ShapeType]> {
    this.isLeaf = false;
    const unitsArr = _toPairs(this.units);
    this.units = {};
    return unitsArr;
  }

  public getRegion (): Region {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
};

class QuadtreePool {
  public pool: Array<QuadtreeNode>;
  public capacity: number;

  constructor(capacity = 10) {
    this.pool = new Array<QuadtreeNode>();
    this.capacity = capacity;
  }

  public create (region: Region, level: number) {
    if (this.pool.length > 0) {
      const quadtreeNode = this.pool.pop() as QuadtreeNode;
      quadtreeNode.init(region, level);
      return quadtreeNode;
    }
    console.log('QuadtreePool empty!!!');
    return new QuadtreeNode(region, level);
  }

  public recycle (quadtreeNode: QuadtreeNode) {
    if (this.pool.length < this.capacity) {
      this.pool.push(quadtreeNode);
    }
    console.log('overflow QuadtreePool!!!');
  }

  public clear () {
    this.pool = new Array<QuadtreeNode>();
  }
}

class Quadtree {
  public maxLevels: number;
  public maxSize: number;
  public tree: Array<QuadtreeNode | undefined>;
  public quadtreePool: QuadtreePool;
  constructor(rootSize: Region, maxLevels = MAX_TREE_LEVELS, maxSize = MAX_Node_SIZE) {
    this.maxLevels = maxLevels;
    this.maxSize = maxSize;
    this.tree = new Array<QuadtreeNode | undefined>();
    const root = new QuadtreeNode(rootSize, 0);
    this.tree[0] = root;
    this.quadtreePool = new QuadtreePool();
  }

  public getChildRegion (fatherRegion: Region): [Region, Region, Region, Region] {
    const { x, y, w, h } = fatherRegion;
    const leftWidth = Math.round(w / 2);
    const rightWidth = w - leftWidth;
    const upHeight = Math.round(h / 2);
    const downHeight = h - upHeight;
    const midPointX = x + leftWidth;
    const midPointY = y + upHeight;
    const leftUp = { x, y, w: leftWidth, h: upHeight };
    const rightUp = { x: midPointX, y, w: rightWidth, h: upHeight };
    const leftDown = { x, y: midPointY, w: leftWidth, h: downHeight };
    const rightDown = { x: midPointX, y: midPointY, w: rightWidth, h: downHeight };
    // | 0 | 1 |
    // | 2 | 3 |
    return [leftUp, rightUp, leftDown, rightDown];
  }

  public getFather (child: number): number {
    return Math.floor((child - 1) / 4);
  }

  public isContain (box: Region, region: Region): boolean {
    const bX = box.x;
    const bY = box.y;
    const bXw = box.x + box.w;
    const bYh = box.y + box.h;
    const rX = region.x;
    const rY = region.y;
    const rXw = region.x + region.w;
    const rYh = region.y + region.h;
    if (
      (rX <= bX && bX <= rXw) ||
      (rX <= bXw && bXw <= rXw) ||
      (rY <= bY && bY <= rYh) ||
      (rY <= bYh && bYh <= rYh)
    ) {
      return true;
    }
    return false;
  }

  // f -> c0: f * 4 + 1, c1: f * 4 + 2, c2: f * 4 + 3, c3: f * 4 + 4
  public insert (id: string, shape: ShapeType, index = 0): boolean {
    const node = this.tree[index] as QuadtreeNode;
    const level = node.level;
    if (node.isLeaf) { // is outter node
      if (node.size < this.maxSize) { // did not exceed capacity
        node.add(id, shape);
        return true;
      } else if (level >= this.maxLevels) { // did not exceed levels
        return false;
      } else { // partition, current node to be inner node
        this.split(index);
      }
    }
    // inner node
    let result = false;
    const region = node.getRegion();
    const childrenRegion = this.getChildRegion(region);
    const childIndex = index + 4 + 1;
    _each(
      childrenRegion,
      (childRegion: Region, quadrant: number) => {
        if (this.isContain(shape.box, childRegion)) {
          const quadrantIndex = childIndex + quadrant;
          if (!this.tree[quadrantIndex]) {
            this.tree[quadrantIndex] = this.quadtreePool.create(childRegion, level + 1);
          }
          result = this.insert(id, shape, quadrantIndex) || result;
        }
      }
    );
    return result;
  }

  public split (index: number) {
    const node = this.tree[index] as QuadtreeNode;
    const level = node.level;
    const region = node.getRegion();
    const childrenRegion = this.getChildRegion(region);
    const childIndex = index + 4 + 1;
    const units = node.clear();
    _each(
      childrenRegion,
      (childRegion: Region, quadrant: number) => {
        _each(
          units,
          ([id, shape]) => {
            if (this.isContain(shape.box, childRegion)) {
              const quadrantIndex = childIndex + quadrant;
              if (!this.tree[quadrantIndex]) {
                this.tree[quadrantIndex] = this.quadtreePool.create(childRegion, level + 1);
              }
              this.insert(id, shape, quadrantIndex);
            }
          }
        );
      }
    );
  }

  public query (id: string, shape: ShapeType, index = 0) {

  }

  public traverse (id: string, shape: ShapeType, index = 0) {

  } 

  public remove (id: string, shape: ShapeType, index = 0): boolean {
    const node = this.tree[index] as QuadtreeNode;
    if (node.isLeaf) {
      const size = node.del(id);
      return size === 0;
    }
    const region = node.getRegion();
    const childrenRegion = this.getChildRegion(region);
    const childIndex = index + 4 + 1;
    const emptyChildCount = _reduce(
      childrenRegion,
      (count: number, childRegion: Region, quadrant: number) => {
        const quadrantIndex = childIndex + quadrant;
        if (this.tree[quadrantIndex]) {
          if (this.isContain(shape.box, childRegion)) {
            const isEmpty = this.remove(id, shape, quadrantIndex);
            if (isEmpty) {
              const recycled = this.tree[quadrantIndex] as QuadtreeNode;
              this.quadtreePool.recycle(recycled);
              this.tree[quadrantIndex] = undefined;
              count += 1;
            }
          }
        } else {
          count += 1
        }
        return count;
      },
      0
    );
    return emptyChildCount === 4;
  }

  public clear () {
    this.quadtreePool.clear();
    _each(
      this.tree,
      (treeNode: QuadtreeNode | undefined, index: number) => {
        if (treeNode) {
          treeNode.clear();
          this.tree[index] = undefined;
        }
      }
    );
    this.tree = new Array<QuadtreeNode | undefined>();
  }
}

export default class Shape {
  private map: Map<string, ShapeType> | null;
  private quadtree: Quadtree | null;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.map = new Map<string, ShapeType>();
    this.quadtree = new Quadtree({ x: 0, y: 0, w: width, h: height });
    this.width = width;
    this.height = height;
  }

  public clear () {
    this.map?.clear();
    this.quadtree?.clear();
  }

  public append (id: string, shape: ShapeType): boolean {
    const isSucc = this.quadtree?.insert(id, shape) ?? false;
    if (isSucc) {
      this.map?.set(id, shape);
    }
    return isSucc;
  }

  public remove (id: string) {
    const shape = this.map?.get(id) ?? null;
    if (shape) {
      this.map?.delete(id);
      this.quadtree?.remove(id, shape);
    }
  }

  public destroy() {
    this.clear();
    this.map = null;
    this.quadtree = null;
  }
};
