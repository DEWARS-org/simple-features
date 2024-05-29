import { ExtendedRedBlackTree } from "./ExtendedRedBlackTree.ts";
import { Segment, SFException } from "../../internal.ts";
import type { Comparator, Event, LineString, Point } from "../../internal.ts";

/**
 * Segment comparator for adding segments to the sweep line in above-below
 * order
 */
class SegmentComparator implements Comparator<Segment> {
  /**
   * Current sweep x value
   */
  private _x: number | undefined;

  /**
   * Set the current sweep x value
   * @param x x value
   */
  public set x(x: number | undefined) {
    this._x = x;
  }

  public get x(): number | undefined {
    return this._x;
  }

  /**
   * {@inheritDoc}
   */
  public compare(segment1: Segment, segment2: Segment): number {
    if (this._x === undefined) {
      throw new SFException("X value not set");
    }

    const y1 = SweepLine.yValueAtX(segment1, this._x);
    const y2 = SweepLine.yValueAtX(segment2, this._x);

    let compare: number;
    if (y1 < y2) {
      compare = -1;
    } else if (y2 < y1) {
      compare = 1;
    } else if (segment1.ring < segment2.ring) {
      compare = -1;
    } else if (segment2.ring < segment1.ring) {
      compare = 1;
    } else if (segment1.edge < segment2.edge) {
      compare = -1;
    } else if (segment2.edge < segment1.edge) {
      compare = 1;
    } else {
      compare = 0;
    }

    return compare;
  }
}

/**
 * Sweep Line algorithm
 */
export class SweepLine {
  /**
   * Polygon rings
   */
  private readonly _rings: LineString[];

  /**
   * Comparator for ordering segments in above-below order
   */
  private _comparator: SegmentComparator;

  /**
   * Tree of segments sorted by above-below order
   */
  private readonly _tree: ExtendedRedBlackTree<Segment>;

  /**
   * Mapping between ring, edges, and segments
   */
  private _segments: Map<number, Map<number, Segment>> = new Map();

  /**
   * Constructor
   * @param rings polygon rings
   */
  public constructor(rings: LineString[]) {
    this._rings = rings;
    this._comparator = new SegmentComparator();
    this._tree = new ExtendedRedBlackTree<Segment>(
      this._comparator.compare.bind(this._comparator),
    );
  }

  /**
   * Add the event to the sweep line
   * @param event event
   * @return added segment
   */
  public add(event: Event): Segment {
    const segment: Segment = this.createSegment(event);

    this._comparator.x = event.point.x;
    this._tree.insert(segment);

    const current = this._tree.findNode(segment);

    if (!current) {
      throw new SFException("Segment not found");
    }

    if (current) {
      const next = this._tree.getSuccessor(current);
      const previous = this._tree.getPredecessor(current);

      // Update the above and below pointers
      if (next) {
        segment.above = next.value;
        next.value.below = segment;
      }
      if (previous) {
        segment.below = previous.value;
        previous.value.above = segment;
      }
    }

    // Add to the segments map
    let edgeMap = this._segments.get(segment.ring);
    if (!edgeMap) {
      edgeMap = new Map<number, Segment>();
      this._segments.set(segment.ring, edgeMap);
    }
    edgeMap.set(segment.edge, segment);

    return segment;
  }

  /**
   * Create a segment from the event
   * @param event event
   * @return segment
   */
  private createSegment(event: Event): Segment {
    const edgeNumber = event.edge;
    const ringNumber = event.ring;

    const ring: LineString = this._rings[ringNumber];
    const points: Point[] = ring.points;

    const point1 = points[edgeNumber];
    const point2 = points[(edgeNumber + 1) % points.length];

    let left: Point;
    let right: Point;
    if (SweepLine.xyOrder(point1, point2) < 0) {
      left = point1;
      right = point2;
    } else {
      right = point1;
      left = point2;
    }

    return new Segment(edgeNumber, ringNumber, left, right);
  }

  /**
   * Find the existing event segment
   *
   * @param event event
   * @return segment
   */
  public find(event: Event): Segment {
    const segment = this._segments.get(event.ring)?.get(event.edge);

    if (!segment) {
      throw new SFException("Segment not found");
    }
    return segment;
  }

  /**
   * Determine if the two segments intersect
   *
   * @param segment1 segment 1
   * @param segment2 segment 2
   * @return true if intersection, false if not
   */
  public intersect(
    segment1: Segment | undefined,
    segment2: Segment | undefined,
  ): boolean {
    let intersect = false;

    if (segment1 && segment2) {
      const ring1 = segment1.ring;
      const ring2 = segment2.ring;

      let consecutive = ring1 === ring2;
      if (consecutive) {
        const edge1 = segment1.edge;
        const edge2 = segment2.edge;
        const ringPoints = this._rings[ring1].numPoints();
        consecutive = (edge1 + 1) % ringPoints === edge2 ||
          edge1 === (edge2 + 1) % ringPoints;
      }

      if (!consecutive) {
        let left = SweepLine.isLeft(segment1, segment2.leftPoint);
        let right = SweepLine.isLeft(segment1, segment2.rightPoint);

        if (left * right <= 0) {
          left = SweepLine.isLeft(segment2, segment1.leftPoint);
          right = SweepLine.isLeft(segment2, segment1.rightPoint);
          if (left * right <= 0) {
            intersect = true;
          }
        }
      }
    }

    return intersect;
  }

  /**
   * Remove the segment from the sweep line
   * @param segment segment
   */
  public remove(segment: Segment): void {
    let removed = this._tree.remove(segment);
    if (removed) {
      this._comparator.x = segment.leftPoint.x;
      removed = this._tree.remove(segment);
    }

    if (removed) {
      const above = segment.above;
      const below = segment.below;
      if (above) {
        above.below = below;
      }
      if (below) {
        below.above = above;
      }

      this._segments.get(segment.ring)?.delete(segment.edge);
    }
  }

  /**
   * Get the segment y value at the x location by calculating the line slope
   *
   * @param segment segment
   * @param x current point x value
   * @return segment y value
   */
  public static yValueAtX(segment: Segment, x: number): number {
    const left: Point = segment.leftPoint;
    const right: Point = segment.rightPoint;

    const m: number = (right.y - left.y) / (right.x - left.x);
    const b: number = left.y - m * left.x;

    return m * x + b;
  }

  /**
   * XY order of two points
   * @param point1 point 1
   * @param point2 point 2
   * @return +1 if p1 &gt; p2, -1 if p1 &lt; p2, 0 if equal
   */
  public static xyOrder(point1: Point, point2: Point): number {
    let value = 0;
    if (point1.x > point2.x) {
      value = 1;
    } else if (point1.x < point2.x) {
      value = -1;
    } else if (point1.y > point2.y) {
      value = 1;
    } else if (point1.y < point2.y) {
      value = -1;
    }
    return value;
  }

  /**
   * Check where the point is (left, on, right) relative to the line segment
   *
   * @param segment segment
   * @param point point
   * @return > 0 if left, 0 if on, < 0 if right
   */
  private static isLeft(segment: Segment, point: Point): number {
    return SweepLine.isLeftPoints(segment.leftPoint, segment.rightPoint, point);
  }

  /**
   * Check where point 2 is (left, on, right) relative to the line from point
   * 0 to point 1
   * @param point0 point 0
   * @param point1 point 1
   * @param point2 point 2
   * @return > 0 if left, 0 if on, < 0 if right
   */
  private static isLeftPoints(
    point0: Point,
    point1: Point,
    point2: Point,
  ): number {
    return (
      (point1.x - point0.x) * (point2.y - point0.y) -
      (point2.x - point0.x) * (point1.y - point0.y)
    );
  }
}
