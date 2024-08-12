import type {
  Geometry,
  GeometryHierarchy,
  GeometryUnion,
} from "../lib/internal.ts";
import {
  GeometryCollection,
  GeometryConstants,
  GeometryEnvelopeBuilder,
  GeometryType,
  GeometryTypeUtils,
  GeometryUtils,
  LineString,
  MultiPolygon,
  Point,
  Polygon,
} from "../lib/internal.ts";
import {
  coinFlip,
  createLineString,
  createMultiLineString,
  createMultiPoint,
  createPoint,
} from "./SFTestUtils.ts";
import { expect } from "@std/expect";

/**
 * Number of random geometries to create for each test
 */
const GEOMETRIES_PER_TEST = 10;

function geometryCentroidTester(geometry: Geometry) {
  const point = geometry.getCentroid();
  const envelope = GeometryEnvelopeBuilder.buildEnvelope(geometry);

  if (geometry.geometryType === GeometryType.Point) {
    expect(envelope.minX).toEqual(point.x);
    expect(envelope.maxX).toEqual(point.x);
    expect(envelope.minY).toEqual(point.y);
    expect(envelope.maxY).toEqual(point.y);
  }

  expect(point.x >= envelope.minX).toBe(true);
  expect(point.x <= envelope.maxX).toBe(true);
  expect(point.y >= envelope.minY).toBe(true);
  expect(point.y <= envelope.maxY).toBe(true);

  const envelopeCentroid1 = envelope.buildGeometry().getCentroid();
  const envelopeCentroid2 = envelope.centroid;

  const deviation = 0.000000000001;

  expect(envelopeCentroid1.x).toBeGreaterThanOrEqual(
    envelopeCentroid2.x - deviation,
  );
  expect(envelopeCentroid1.x).toBeLessThanOrEqual(
    envelopeCentroid2.x + deviation,
  );

  expect(envelopeCentroid1.y).toBeGreaterThanOrEqual(
    envelopeCentroid2.y - deviation,
  );
  expect(envelopeCentroid1.y).toBeLessThanOrEqual(
    envelopeCentroid2.y + deviation,
  );

  return point;
}

function createPolygon() {
  const polygon = Polygon.create();
  const lineString = LineString.create();
  lineString.addPoint(createRandomPoint(-180.0, 45.0, 90.0, 45.0));
  lineString.addPoint(createRandomPoint(-180.0, -90.0, 90.0, 45.0));
  lineString.addPoint(createRandomPoint(90.0, -90.0, 90.0, 45.0));
  lineString.addPoint(createRandomPoint(90.0, 45.0, 90.0, 45.0));
  polygon.addRing(lineString);

  const holeLineString = LineString.create();
  holeLineString.addPoint(createRandomPoint(-90.0, 0.0, 90.0, 45.0));
  holeLineString.addPoint(createRandomPoint(-90.0, -45.0, 90.0, 45.0));
  holeLineString.addPoint(createRandomPoint(0.0, -45.0, 90.0, 45.0));
  holeLineString.addPoint(createRandomPoint(0.0, 0.0, 90.0, 45.0));
  polygon.addRing(holeLineString);
  return polygon;
}

function createRandomPoint(
  minX: number,
  minY: number,
  xRange: number,
  yRange: number,
) {
  const x = minX + Math.random() * xRange;
  const y = minY + Math.random() * yRange;
  return Point.createFromXY(x, y);
}

function createMultiPolygon() {
  const multiPolygon = MultiPolygon.create();
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    multiPolygon.addPolygon(createPolygon());
  }
  return multiPolygon;
}

function createGeometryCollection(hasZ: boolean, hasM: boolean) {
  const geometryCollection = GeometryCollection.create(hasZ, hasM);
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    let geometry: GeometryUnion | undefined;
    const randomGeometry = Math.floor(Math.random() * 6);

    switch (randomGeometry) {
      case 0: {
        geometry = createPoint(hasZ, hasM);
        break;
      }
      case 1: {
        geometry = createLineString(hasZ, hasM);
        break;
      }
      case 2: {
        geometry = createPolygon();
        break;
      }
      case 3: {
        geometry = createMultiPoint(hasZ, hasM);
        break;
      }
      case 4: {
        geometry = createMultiLineString(hasZ, hasM);
        break;
      }
      case 5: {
        geometry = createMultiPolygon();
        break;
      }
    }

    if (geometry) {
      geometryCollection.addGeometry(geometry);
    }
  }

  return geometryCollection;
}

/**
 * Test the child hierarchy recursively
 * @param geometryType geometry type
 * @param childHierarchy child hierarchy
 */

function testChildHierarchy(
  geometryType: GeometryType,
  childHierarchy: GeometryHierarchy | undefined,
) {
  const childTypes = GeometryUtils.childTypes(geometryType);
  if (childTypes.length === 0) {
    expect(childHierarchy).toBeUndefined();
  } else if (childHierarchy) {
    expect(childTypes.length).toEqual(childHierarchy.size);
    for (const childType of childTypes) {
      expect(childHierarchy.has(childType)).toBe(true);
      expect(geometryType).toEqual(GeometryUtils.parentType(childType));
      expect(geometryType).toEqual(GeometryUtils.parentHierarchy(childType)[0]);
      const childChildHierarchy = childHierarchy.get(childType);
      expect(childChildHierarchy).not.toBeUndefined;
      if (childChildHierarchy) {
        testChildHierarchy(childType, childChildHierarchy);
      }
    }
  }
}

Deno.test("test point centroid", () => {
  for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
    // Create and test a point
    const point = createPoint(coinFlip(), coinFlip());
    expect(GeometryUtils.getDimension(point)).toEqual(0);
    geometryCentroidTester(point);
  }
});

Deno.test("test line string centroid", () => {
  for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
    // Create and test a line string
    const lineString = createLineString(coinFlip(), coinFlip());
    expect(GeometryUtils.getDimension(lineString)).toEqual(1);
    geometryCentroidTester(lineString);
  }
});

Deno.test("test polygon centroid", () => {
  for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
    // Create and test a polygon
    const polygon = createPolygon();
    expect(GeometryUtils.getDimension(polygon)).toEqual(2);
    geometryCentroidTester(polygon);
  }
});

Deno.test("test MultiPoint centroid", () => {
  for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
    // Create and test a multi point
    const multiPoint = createMultiPoint(coinFlip(), coinFlip());
    expect(GeometryUtils.getDimension(multiPoint)).toEqual(0);
    geometryCentroidTester(multiPoint);
  }
});

Deno.test("test MultiLineString centroid", () => {
  for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
    // Create and test a multi line string
    const multiLineString = createMultiLineString(coinFlip(), coinFlip());
    expect(GeometryUtils.getDimension(multiLineString)).toEqual(1);
    geometryCentroidTester(multiLineString);
  }
});

Deno.test("test MultiPolygon centroid", () => {
  for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
    // Create and test a multi polygon
    const multiPolygon = createMultiPolygon();
    expect(GeometryUtils.getDimension(multiPolygon)).toEqual(2);
    geometryCentroidTester(multiPolygon);
  }
});

Deno.test("test GeometryCollection centroid", () => {
  for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
    // Create and test a geometry collection
    const geometryCollection = createGeometryCollection(
      coinFlip(),
      coinFlip(),
    );
    geometryCentroidTester(geometryCollection);
  }
});

Deno.test("test polygon centroid with and without hole", () => {
  const polygon = Polygon.create();
  const lineString = LineString.create();
  lineString.addPoint(Point.createFromXY(-90, 45));
  lineString.addPoint(Point.createFromXY(-90, -45));
  lineString.addPoint(Point.createFromXY(90, -45));
  lineString.addPoint(Point.createFromXY(90, 45));
  polygon.addRing(lineString);
  expect(GeometryUtils.getDimension(polygon)).toEqual(2);
  let centroid = geometryCentroidTester(polygon);
  expect(centroid.x).toEqual(0.0);
  expect(centroid.y).toEqual(0.0);
  const holeLineString = LineString.create();
  holeLineString.addPoint(Point.createFromXY(0, 45));
  holeLineString.addPoint(Point.createFromXY(0, 0));
  holeLineString.addPoint(Point.createFromXY(90, 0));
  holeLineString.addPoint(Point.createFromXY(90, 45));
  polygon.addRing(holeLineString);
  expect(GeometryUtils.getDimension(polygon)).toEqual(2);
  centroid = geometryCentroidTester(polygon);
  expect(centroid.x).toEqual(-15.0);
  expect(centroid.y).toEqual(-7.5);
});

Deno.test("test copy, minimize, and normalize", () => {
  const polygon = Polygon.create();
  const ring = LineString.create();
  const random = Math.random();
  if (random < 0.5) {
    ring.addPoint(createRandomPoint(90.0, 0.0, 90.0, 90.0));
    ring.addPoint(createRandomPoint(90.0, -90.0, 90.0, 90.0));
    ring.addPoint(createRandomPoint(-180.0, -90.0, 89.0, 90.0));
    ring.addPoint(createRandomPoint(-180.0, 0.0, 89.0, 90.0));
  } else {
    ring.addPoint(createRandomPoint(-180.0, 0.0, 89.0, 90.0));
    ring.addPoint(createRandomPoint(-180.0, -90.0, 89.0, 90.0));
    ring.addPoint(createRandomPoint(90.0, -90.0, 90.0, 90.0));
    ring.addPoint(createRandomPoint(90.0, 0.0, 90.0, 90.0));
  }
  polygon.addRing(ring);

  const polygon2 = polygon.copy();
  GeometryUtils.minimizeGeometry(polygon2, 180.0);

  const polygon3 = polygon2.copy();
  GeometryUtils.normalizeGeometry(polygon3, 180.0);

  const points = ring.points;
  const ring2 = polygon2.rings[0];
  const points2 = ring2.points;
  const ring3 = polygon3.rings[0];
  const points3 = ring3.points;

  const deviation = 0.000000000001;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const point2 = points2[i];
    const point3 = points3[i];
    expect(point.y).toBeGreaterThanOrEqual(point2.y - deviation);
    expect(point.y).toBeLessThanOrEqual(point2.y + deviation);
    expect(point.y).toBeGreaterThanOrEqual(point3.y - deviation);
    expect(point.y).toBeLessThanOrEqual(point3.y + deviation);
    expect(point.x).toBeGreaterThanOrEqual(point3.x - deviation);
    expect(point.x).toBeLessThanOrEqual(point3.x + deviation);

    if (i < 2) {
      expect(point2.x).toBeGreaterThanOrEqual(point2.x - deviation);
      expect(point2.x).toBeLessThanOrEqual(point2.x + deviation);
    } else {
      let point2Value = point2.x;
      if (random < 0.5) {
        point2Value -= 360.0;
      } else {
        point2Value += 360.0;
      }
      expect(point.x).toBeGreaterThanOrEqual(point2Value - deviation);
      expect(point.x).toBeLessThanOrEqual(point2Value + deviation);
    }
  }
});

Deno.test("test simplify points", () => {
  const halfWorldWidth = GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH;

  const points = [];
  const distances = [];

  let x = Math.random() * halfWorldWidth * 2 - halfWorldWidth;
  let y = Math.random() * halfWorldWidth * 2 - halfWorldWidth;
  let point = Point.createFromXY(x, y);
  points.push(point);

  for (let i = 1; i < 100; i++) {
    const xChange = 100000.0 * Math.random() * (Math.random() < 0.5 ? 1 : -1);
    x += xChange;

    const yChange = 100000.0 * Math.random() * (Math.random() < 0.5 ? 1 : -1);
    y += yChange;
    if (y > halfWorldWidth || y < -halfWorldWidth) {
      y -= 2 * yChange;
    }

    const previousPoint = point;
    point = Point.createFromXY(x, y);
    points.push(point);

    const distance = GeometryUtils.distance(previousPoint, point);
    distances.push(distance);
  }

  const sortedDistances = distances.sort();
  const tolerance = sortedDistances[Math.round(sortedDistances.length / 2)];

  const simplifiedPoints = GeometryUtils.simplifyPoints(points, tolerance);

  expect(simplifiedPoints.length).toBeLessThanOrEqual(points.length);

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const firstSimplifiedPoint = simplifiedPoints[0];
  const lastSimplifiedPoint = simplifiedPoints[simplifiedPoints.length - 1];

  expect(firstPoint.x).toEqual(firstSimplifiedPoint.x);
  expect(firstPoint.y).toEqual(firstSimplifiedPoint.y);
  expect(lastPoint.x).toEqual(lastSimplifiedPoint.x);
  expect(lastPoint.y).toEqual(lastSimplifiedPoint.y);

  let pointIndex = 0;
  for (let i = 1; i < simplifiedPoints.length; i++) {
    const simplifiedPoint = simplifiedPoints[i];
    const simplifiedDistance = GeometryUtils.distance(
      simplifiedPoints[i - 1],
      simplifiedPoint,
    );

    expect(simplifiedDistance).toBeGreaterThanOrEqual(tolerance);

    for (pointIndex++; pointIndex < points.length; pointIndex++) {
      const newPoint = points[pointIndex];
      if (
        newPoint.x === simplifiedPoint.x &&
        newPoint.y === simplifiedPoint.y
      ) {
        break;
      }
    }
    expect(pointIndex < points.length).toBe(true);
  }
});

Deno.test("test point in polygon", () => {
  const points = [];
  points.push(Point.createFromXY(0, 5));
  points.push(Point.createFromXY(5, 0));
  points.push(Point.createFromXY(10, 5));
  points.push(Point.createFromXY(5, 10));
  expect(GeometryUtils.closedPolygonPoints(points)).toBe(false);

  let deviation = 0.00000000000001;

  for (const point of points) {
    expect(GeometryUtils.pointInPolygonRingPoints(point, points)).toBe(true);
  }

  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(deviation, 5),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(5, deviation),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(10 - deviation, 5),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(5, 10 - deviation),
      points,
    ),
  ).toBe(true);

  expect(
    GeometryUtils.pointInPolygonRingPoints(Point.createFromXY(5, 5), points),
  ).toBe(true);

  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5 + deviation, 7.5 - deviation),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5 + deviation, 2.5 + deviation),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(7.5 - deviation, 2.5 + deviation),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(7.5 - deviation, 7.5 - deviation),
      points,
    ),
  ).toBe(true);

  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5, 7.5),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5, 2.5),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(7.5, 2.5),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(7.5, 7.5),
      points,
    ),
  ).toBe(true);

  deviation = 0.0000001;

  expect(
    GeometryUtils.pointInPolygonRingPoints(Point.createFromXY(0, 0), points),
  ).toBe(false);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(0 - deviation, 5),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(5, 0 - deviation),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(10 + deviation, 5),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(5, 10 + deviation),
      points,
    ),
  ).toBe(false);

  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5 - deviation, 7.5 + deviation),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5 - deviation, 2.5 - deviation),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(7.5 + deviation, 2.5 - deviation),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(7.5 + deviation, 7.5 + deviation),
      points,
    ),
  ).toBe(false);

  const firstPoint = points[0];
  points.push(Point.createFromXY(firstPoint.x, firstPoint.y));

  expect(GeometryUtils.closedPolygonPoints(points)).toBe(true);

  for (const point of points) {
    expect(GeometryUtils.pointInPolygonRingPoints(point, points)).toBe(true);
  }

  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5 + deviation, 7.5 - deviation),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5, 7.5),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointInPolygonRingPoints(
      Point.createFromXY(2.5 - deviation, 7.5 + deviation),
      points,
    ),
  ).toBe(false);
});

Deno.test("test closed polygon", () => {
  const points = [];
  points.push(Point.createFromXY(0.1, 0.2));
  points.push(Point.createFromXY(5.3, 0.4));
  points.push(Point.createFromXY(5.5, 5.6));
  expect(GeometryUtils.closedPolygonPoints(points)).toBe(false);
  const firstPoint = points[0];
  points.push(Point.createFromXY(firstPoint.x, firstPoint.y));
  expect(GeometryUtils.closedPolygonPoints(points)).toBe(true);
});

Deno.test("test point on line", () => {
  const points = [];
  points.push(Point.createFromXY(0, 0));
  points.push(Point.createFromXY(5, 0));
  points.push(Point.createFromXY(5, 5));

  for (const point of points) {
    expect(GeometryUtils.pointOnLinePoints(point, points)).toBe(true);
  }
  expect(GeometryUtils.pointOnLinePoints(Point.createFromXY(2.5, 0), points))
    .toBe(
      true,
    );
  expect(GeometryUtils.pointOnLinePoints(Point.createFromXY(5, 2.5), points))
    .toBe(
      true,
    );
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(2.5, 0.00000001),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(2.5, 0.0000001),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(5, 2.500000001),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(5, 2.50000001),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(-0.0000000000000001, 0),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(-0.000000000000001, 0),
      points,
    ),
  ).toBe(false);
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(5, 5.0000000000000001),
      points,
    ),
  ).toBe(true);
  expect(
    GeometryUtils.pointOnLinePoints(
      Point.createFromXY(5, 5.000000000000001),
      points,
    ),
  ).toBe(false);
});

/**
 * Test the geometry type parent and child hierarchy methods
 */
Deno.test("test hierarchy", () => {
  for (const geometryType of GeometryTypeUtils.values()) {
    let parentType = GeometryUtils.parentType(geometryType);
    let parentHierarchy = GeometryUtils.parentHierarchy(geometryType);
    let previousParentType: GeometryType | undefined;

    while (parentType !== undefined) {
      // The parent type should be the first element in the parent hierarchy
      expect(parentType).toEqual(parentHierarchy[0]);
      // The parent type should be the parent of the previous parent type
      if (previousParentType !== undefined) {
        const childTypes = GeometryUtils.childTypes(parentType);
        expect(childTypes.indexOf(previousParentType) > -1).toBe(true);
        const childHierarchy = GeometryUtils.childHierarchy(parentType);
        expect(childHierarchy).not.toBeUndefined;
        if (childHierarchy) {
          expect(childHierarchy.get(previousParentType)).not.toBeUndefined;
        }
      }

      previousParentType = parentType;
      parentType = GeometryUtils.parentType(previousParentType);
      parentHierarchy = GeometryUtils.parentHierarchy(previousParentType);
    }

    // expect the parent hierarchy to be empty as the geometry type is at the top of the hierarchy
    expect(parentHierarchy.length).toEqual(0);
    testChildHierarchy(
      geometryType,
      GeometryUtils.childHierarchy(geometryType),
    );
  }
});

/**
 * Test centroid and degrees centroid
 */
Deno.test("test centroid", () => {
  const point = Point.createFromXY(15, 35);

  let centroid = point.getCentroid();
  expect(centroid.x).toEqual(15);
  expect(centroid.y).toEqual(35);

  let degreesCentroid = point.getDegreesCentroid();

  expect(degreesCentroid.x).toEqual(15);
  expect(degreesCentroid.y).toEqual(35);

  const lineString = LineString.create();
  lineString.addPoint(Point.createFromXY(0, 5));
  lineString.addPoint(point);

  centroid = lineString.getCentroid();

  expect(centroid.x).toEqual(7.5);
  expect(centroid.y).toEqual(20.0);

  degreesCentroid = lineString.getDegreesCentroid();

  expect(degreesCentroid.x).toEqual(6.764392425440724);
  expect(degreesCentroid.y).toEqual(20.157209770845522);

  lineString.addPoint(Point.createFromXY(2, 65));

  centroid = lineString.getCentroid();

  expect(centroid.x).toEqual(7.993617921179541);
  expect(centroid.y).toEqual(34.808537635386266);

  degreesCentroid = lineString.getDegreesCentroid();

  expect(degreesCentroid.x).toEqual(5.85897989020252);
  expect(degreesCentroid.y).toEqual(35.20025371999032);

  const polygon = Polygon.createFromLineString(lineString);

  centroid = polygon.getCentroid();

  expect(centroid.x).toEqual(5.666666666666667);
  expect(centroid.y).toEqual(35.0);

  degreesCentroid = polygon.getDegreesCentroid();

  expect(degreesCentroid.x).toEqual(5.85897989020252);
  expect(degreesCentroid.y).toEqual(35.20025371999032);

  lineString.addPoint(Point.createFromXY(-20, 40));
  lineString.addPoint(Point.createFromXY(0, 5));

  centroid = polygon.getCentroid();

  expect(centroid.x).toEqual(-1.3554502369668247);
  expect(centroid.y).toEqual(36.00315955766193);

  degreesCentroid = polygon.getDegreesCentroid();

  expect(degreesCentroid.x).toEqual(-0.6891904581641471);
  expect(degreesCentroid.y).toEqual(37.02524099014426);
});
