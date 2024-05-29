import type { Point, Polygon, Segment } from "../../mod.ts";
import {
  EventQueue,
  EventType,
  GeometryUtils,
  LineString,
  SweepLine,
} from "../../mod.ts";

/**
 * Shamos-Hoey simple polygon detection
 * <p>
 * Based upon C++ implementation:
 * <p>
 * <a href=
 * "http://geomalgorithms.com/a09-_intersect-3.html">http://geomalgorithms.com/a09-_intersect-3.html</a>
 * <p>
 * C++ implementation license:
 * <p>
 * Copyright 2001 softSurfer, 2012 Dan Sunday This code may be freely used and
 * modified for any purpose providing that this copyright notice is included
 * with it. SoftSurfer makes no warranty for this code, and cannot be held
 * liable for any real or imagined damage resulting from its use. Users of this
 * code must verify correctness for their application.
 */

export class ShamosHoey {
  /**
   * Determine if the polygon is simple
   * @param polygon polygon
   * @return true if simple, false if intersects
   */
  public static simplePolygon(polygon: Polygon): boolean {
    return ShamosHoey.simplePolygonLineStrings(polygon.rings);
  }

  /**
   * Determine if the polygon points are simple
   * @param points polygon as points
   * @return true if simple, false if intersects
   */
  public static simplePolygonPoints(points: Point[]): boolean {
    return ShamosHoey.simplePolygonLineString(
      LineString.createFromPoints(points),
    );
  }

  /**
   * Determine if the polygon point rings are simple
   * @param pointRings polygon point rings
   * @return true if simple, false if intersects
   */
  public static simplePolygonRingPoints(pointRings: Point[][]): boolean {
    const rings: LineString[] = pointRings.map(
      (points) => LineString.createFromPoints(points),
    );
    return ShamosHoey.simplePolygonLineStrings(rings);
  }

  /**
   * Determine if the polygon line string ring is simple
   * @param ring polygon ring as a line string
   * @return true if simple, false if intersects
   */
  public static simplePolygonLineString(ring: LineString): boolean {
    return ShamosHoey.simplePolygonLineStrings([ring]);
  }

  /**
   * Determine if the polygon rings are simple
   * @param rings polygon rings
   * @return true if simple, false if intersects
   */
  public static simplePolygonLineStrings(rings: LineString[]): boolean {
    let simple = rings.length !== 0;

    const ringCopies: LineString[] = [];
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i];

      // Copy the ring
      const ringCopy: LineString = LineString.create();
      ringCopy.points = ring.points.slice();
      ringCopies.push(ringCopy);

      // Remove the last point when identical to the first
      const ringCopyPoints: Point[] = ringCopy.points;
      if (ringCopyPoints.length >= 3) {
        const first: Point = ringCopyPoints[0];
        const last: Point = ringCopyPoints[ringCopyPoints.length - 1];
        if (first.x === last.x && first.y === last.y) {
          ringCopyPoints.pop();
        }
      }

      // Verify enough ring points
      if (ringCopyPoints.length < 3) {
        simple = false;
        break;
      }

      // Check holes to make sure the first point is in the polygon
      if (i > 0) {
        const firstPoint: Point = ringCopyPoints[0];
        if (!GeometryUtils.pointInPolygonRing(firstPoint, rings[0])) {
          simple = false;
          break;
        }
        // Make sure the hole first points are not inside of one another
        for (let j = 1; j < i; j++) {
          const holePoints: Point[] = rings[j].points;
          if (
            GeometryUtils.pointInPolygonRingPoints(firstPoint, holePoints) ||
            GeometryUtils.pointInPolygonRingPoints(
              holePoints[0],
              ringCopyPoints,
            )
          ) {
            simple = false;
            break;
          }
        }
        if (!simple) {
          break;
        }
      }
    }

    // If valid polygon rings
    if (simple) {
      const eventQueue: EventQueue = new EventQueue(ringCopies);
      const sweepLine: SweepLine = new SweepLine(ringCopies);

      for (const event of eventQueue) {
        if (event.type === EventType.Left) {
          const segment: Segment = sweepLine.add(event);

          if (
            sweepLine.intersect(segment, segment.below) ||
            sweepLine.intersect(segment, segment.above)
          ) {
            simple = false;
            break;
          }
        } else {
          const segment = sweepLine.find(event);
          if (sweepLine.intersect(segment.above, segment.below)) {
            simple = false;
            break;
          }
          sweepLine.remove(segment);
        }
      }
    }

    return simple;
  }
}
