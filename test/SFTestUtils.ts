import { expect } from "@std/expect";
import { assert } from "@std/assert";
import type {
  CircularString,
  Geometry,
  GeometryEnvelope,
  PolyhedralSurface,
  TIN,
  Triangle,
} from "../lib/internal.ts";
import {
  CompoundCurve,
  CurvePolygon,
  GeometryCollection,
  GeometryType,
  GeometryTypeUtils,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  SFException,
} from "../lib/internal.ts";

export const compareEnvelopes = (
  expected: GeometryEnvelope,
  actual: GeometryEnvelope,
) => {
  if (expected == null) {
    expect(actual).toBeUndefined();
  } else {
    expect(actual).not.toBeUndefined;
    expect(expected.minX).toEqual(actual.minX);
    expect(expected.maxX).toEqual(actual.maxX);
    expect(expected.minY).toEqual(actual.minY);
    expect(expected.maxY).toEqual(actual.maxY);
    expect(expected.minZ).toEqual(actual.minZ);
    expect(expected.maxZ).toEqual(actual.maxZ);
    expect(expected.hasZ).toEqual(actual.hasZ);
    expect(expected.minM).toEqual(actual.minM);
    expect(expected.maxM).toEqual(actual.maxM);
    expect(expected.hasM).toEqual(actual.hasM);
  }
};

/**
 * Compare two geometries and verify they are equal
 * @param expected
 * @param actual
 */

export const compareGeometries = (
  expected: Geometry,
  actual: Geometry,
) => {
  if (expected == null) {
    expect(actual).toBeUndefined();
  } else {
    expect(actual).not.toBeUndefined;

    switch (expected.geometryType) {
      case GeometryType.Geometry: {
        assert(`Unexpected Geometry Type of ${
          GeometryTypeUtils.nameFromType(
            expected.geometryType,
          )
        } which is abstract`);
        break;
      }
      case GeometryType.Point: {
        comparePoint(actual as Point, expected as Point);
        break;
      }
      case GeometryType.LineString: {
        compareLineString(expected as LineString, actual as LineString);
        break;
      }
      case GeometryType.Polygon: {
        comparePolygon(expected as Polygon, actual as Polygon);
        break;
      }
      case GeometryType.MultiPoint: {
        compareMultiPoint(expected as MultiPoint, actual as MultiPoint);
        break;
      }
      case GeometryType.MultiLineString: {
        compareMultiLineString(
          expected as MultiLineString,
          actual as MultiLineString,
        );
        break;
      }
      case GeometryType.MultiPolygon: {
        compareMultiPolygon(expected as MultiPolygon, actual as MultiPolygon);
        break;
      }
      case GeometryType.GeometryCollection:
      case GeometryType.MultiCurve:
      case GeometryType.MultiSurface: {
        compareGeometryCollection(
          expected as GeometryCollection,
          actual as GeometryCollection,
        );
        break;
      }
      case GeometryType.CircularString: {
        compareCircularString(
          expected as CircularString,
          actual as CircularString,
        );
        break;
      }
      case GeometryType.CompoundCurve: {
        compareCompoundCurve(
          expected as CompoundCurve,
          actual as CompoundCurve,
        );
        break;
      }
      case GeometryType.CurvePolygon: {
        compareCurvePolygon(expected as CurvePolygon, actual as CurvePolygon);
        break;
      }
      case GeometryType.Curve: {
        assert(
          `Unexpected Geometry Type of ${
            GeometryTypeUtils.nameFromType(
              expected.geometryType,
            )
          } which is abstract`,
        );
        break;
      }
      case GeometryType.Surface: {
        assert(
          `Unexpected Geometry Type of ${
            GeometryTypeUtils.nameFromType(
              expected.geometryType,
            )
          } which is abstract`,
        );
        break;
      }
      case GeometryType.PolyhedralSurface: {
        comparePolyhedralSurface(
          expected as PolyhedralSurface,
          actual as PolyhedralSurface,
        );
        break;
      }
      case GeometryType.Tin: {
        compareTIN(expected as TIN, actual as TIN);
        break;
      }
      case GeometryType.Triangle: {
        compareTriangle(expected as Triangle, actual as Triangle);
        break;
      }
      default:
        throw new Error(
          `Geometry Type not supported: ${expected.geometryType}`,
        );
    }
  }
};

/**
 * Compare to the base attributes of two geometries
 *
 * @param expected
 * @param actual
 */
export const compareBaseGeometryAttributes = (
  expected: Geometry,
  actual: Geometry,
) => {
  expect(expected.geometryType).toEqual(actual.geometryType);
  expect(expected.hasZ).toEqual(actual.hasZ);
  expect(expected.hasM).toEqual(actual.hasM);
};

/**
 * Compare the two points for equality
 *
 * @param expected
 * @param actual
 */
export const comparePoint = (
  expected: Point,
  actual: Point,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.equals(actual)).toBe(true);
};

/**
 * Compare the two line strings for equality
 *
 * @param expected
 * @param actual
 */
export const compareLineString = (
  expected: LineString,
  actual: LineString,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numPoints()).toEqual(actual.numPoints());
  for (let i = 0; i < expected.numPoints(); i++) {
    comparePoint(expected.getPoint(i), actual.getPoint(i));
  }
};

/**
 * Compare the two polygons for equality
 *
 * @param expected
 * @param actual
 */
export const comparePolygon = (
  expected: Polygon,
  actual: Polygon,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numRings()).toEqual(actual.numRings());
  for (let i = 0; i < expected.numRings(); i++) {
    compareLineString(expected.getRing(i), actual.getRing(i));
  }
};

/**
 * Compare the two multi points for equality
 *
 * @param expected
 * @param actual
 */
export const compareMultiPoint = (
  expected: MultiPoint,
  actual: MultiPoint,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numPoints()).toEqual(actual.numPoints());
  for (let i = 0; i < expected.numPoints(); i++) {
    comparePoint(expected.points[i], actual.points[i]);
  }
};

/**
 * Compare the two multi line strings for equality
 *
 * @param expected
 * @param actual
 */
export const compareMultiLineString = (
  expected: MultiLineString,
  actual: MultiLineString,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numLineStrings()).toEqual(actual.numLineStrings());
  for (let i = 0; i < expected.numLineStrings(); i++) {
    compareLineString(expected.lineStrings[i], actual.lineStrings[i]);
  }
};

/**
 * Compare the two multi polygons for equality
 *
 * @param expected
 * @param actual
 */
export const compareMultiPolygon = (
  expected: MultiPolygon,
  actual: MultiPolygon,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numPolygons()).toEqual(actual.numPolygons());
  for (let i = 0; i < expected.numPolygons(); i++) {
    comparePolygon(expected.polygons[i], actual.polygons[i]);
  }
};

/**
 * Compare the two geometry collections for equality
 *
 * @param expected
 * @param actual
 */

export const compareGeometryCollection = (
  expected: GeometryCollection,
  actual: GeometryCollection,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numGeometries()).toEqual(actual.numGeometries());
  for (let i = 0; i < expected.numGeometries(); i++) {
    compareGeometries(
      expected.getGeometry(i),
      actual.getGeometry(i),
    );
  }
};

/**
 * Compare the two circular strings for equality
 *
 * @param expected
 * @param actual
 */
export const compareCircularString = (
  expected: CircularString,
  actual: CircularString,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numPoints()).toEqual(actual.numPoints());
  for (let i = 0; i < expected.numPoints(); i++) {
    comparePoint(expected.points[i], actual.points[i]);
  }
};

/**
 * Compare the two compound curves for equality
 *
 * @param expected
 * @param actual
 */
export const compareCompoundCurve = (
  expected: CompoundCurve,
  actual: CompoundCurve,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numLineStrings()).toEqual(actual.numLineStrings());
  for (let i = 0; i < expected.numLineStrings(); i++) {
    compareLineString(expected.lineStrings[i], actual.lineStrings[i]);
  }
};

/**
 * Compare the two curve polygons for equality
 *
 * @param expected
 * @param actual
 */
export const compareCurvePolygon = (
  expected: CurvePolygon,
  actual: CurvePolygon,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numRings()).toEqual(actual.numRings());
  for (let i = 0; i < expected.numRings(); i++) {
    compareGeometries(expected.rings[i], actual.rings[i]);
  }
};

/**
 * Compare the two polyhedral surfaces for equality
 *
 * @param expected
 * @param actual
 */
export const comparePolyhedralSurface = (
  expected: PolyhedralSurface,
  actual: PolyhedralSurface,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numPolygons()).toEqual(actual.numPolygons());
  for (let i = 0; i < expected.numPolygons(); i++) {
    compareGeometries(expected.polygons[i], actual.polygons[i]);
  }
};

/**
 * Compare the two TINs for equality
 *
 * @param expected
 * @param actual
 */
export const compareTIN = (
  expected: TIN,
  actual: TIN,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numPolygons()).toEqual(actual.numPolygons());
  for (let i = 0; i < expected.numPolygons(); i++) {
    compareGeometries(expected.polygons[i], actual.polygons[i]);
  }
};

/**
 * Compare the two triangles for equality
 *
 * @param expected
 * @param actual
 */
export const compareTriangle = (
  expected: Triangle,
  actual: Triangle,
) => {
  compareBaseGeometryAttributes(expected, actual);
  expect(expected.numRings()).toEqual(actual.numRings());
  for (let i = 0; i < expected.numRings(); i++) {
    compareLineString(expected.rings[i], actual.rings[i]);
  }
};

// /**
//  * Compare two byte arrays and verify they are equal
//  *
//  * @param expected
//  * @param actual
//  */
// export const compareByteArrays = (expected, actual, expect: Expect) => {
//   expected.length.should.be.equal(actual.length);
//   for (let i = 0; i < expected.length; i++) {
//     expected[i].should.be.equal(actual[i], `Byte: ${i}`);
//   }
// };

// /**
//  * Compare two byte arrays and verify they are equal
//  *
//  * @param expected
//  * @param actual
//  * @returns true if equal
//  */
// export const equalByteArrays = (expected, actual) => {
//   let equal = expected.length === actual.length;

//   for (let i = 0; equal && i < expected.length; i++) {
//     equal = expected[i] === actual[i];
//   }
//   return equal;
// };

/**
 * Create a random point
 *
 * @param hasZ
 * @param hasM
 * @returnsPoint
 */
export const createPoint = (hasZ: boolean, hasM: boolean) => {
  const x = Math.random() * 180.0 * (Math.random() < 0.5 ? 1 : -1);
  const y = Math.random() * 90.0 * (Math.random() < 0.5 ? 1 : -1);
  const point = Point.createFromXY(x, y);
  if (hasZ) {
    point.z = Math.random() * 1000.0;
  }
  if (hasM) {
    point.m = Math.random() * 1000.0;
  }
  return point;
};

/**
 * Create a random line string
 *
 * @param hasZ
 * @param hasM
 * @param ring
 * @returnsLineString
 */
export const createLineString = (
  hasZ: boolean,
  hasM: boolean,
  ring = false,
) => {
  const lineString = LineString.create(hasZ, hasM);
  const num = 2 + Math.round(Math.random() * 9);
  for (let i = 0; i < num; i++) {
    lineString.addPoint(createPoint(hasZ, hasM));
  }
  if (ring) {
    lineString.addPoint(lineString.points[0]);
  }
  return lineString;
};

/**
 * Create a random polygon
 * @param hasZ
 * @param hasM
 * @returnsPolygon
 */
export const createPolygon = (hasZ: boolean, hasM: boolean) => {
  const polygon = Polygon.create(hasZ, hasM);
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    polygon.addRing(createLineString(hasZ, hasM, true));
  }
  return polygon;
};

/**
 * Create a random multi point
 *
 * @param hasZ
 * @param hasM
 * @returnsMultiPoint
 */
export const createMultiPoint = (hasZ: boolean, hasM: boolean) => {
  const multiPoint = MultiPoint.create(hasZ, hasM);
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    multiPoint.addPoint(createPoint(hasZ, hasM));
  }
  return multiPoint;
};

/**
 * Create a random multi line string
 *
 * @param hasZ
 * @param hasM
 * @returnsMultiLineString
 */
export const createMultiLineString = (hasZ: boolean, hasM: boolean) => {
  const multiLineString = MultiLineString.create(hasZ, hasM);
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    multiLineString.addLineString(createLineString(hasZ, hasM));
  }
  return multiLineString;
};

/**
 * Create a random multi polygon
 *
 * @param hasZ
 * @param hasM
 * @returnsMultiPolygon
 */
export const createMultiPolygon = (hasZ: boolean, hasM: boolean) => {
  const multiPolygon = MultiPolygon.create(hasZ, hasM);
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    multiPolygon.addPolygon(createPolygon(hasZ, hasM));
  }
  return multiPolygon;
};

/**
 * Create a random geometry collection
 *
 * @param hasZ
 * @param hasM
 * @returnsGeometryCollection
 */
export const createGeometryCollection = (hasZ: boolean, hasM: boolean) => {
  const geometryCollection = GeometryCollection.create(hasZ, hasM);
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    let geometry = null;
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
        geometry = createPolygon(hasZ, hasM);
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
        geometry = createMultiPolygon(hasZ, hasM);
        break;
      }
    }

    if (geometry) {
      geometryCollection.addGeometry(geometry);
    } else {
      throw new SFException("Geometry not created");
    }
  }

  return geometryCollection;
};

/**
 * Creates a random point
 * @param minX
 * @param minY
 * @param xRange
 * @param yRange
 * @returns Point
 */
export const createRandomPoint = (
  minX: number,
  minY: number,
  xRange: number,
  yRange: number,
) => {
  const x = minX + Math.random() * xRange;
  const y = minY + Math.random() * yRange;
  return Point.createFromXY(x, y);
};

/**
 * Create a random compound curve
 *
 * @param hasZ
 * @param hasM
 * @param ring
 * @returnsCompoundCurve
 */
export const createCompoundCurve = (
  hasZ: boolean,
  hasM: boolean,
  ring = false,
) => {
  const compoundCurve = CompoundCurve.create(hasZ, hasM);
  const num = 2 + Math.round(Math.random() * 9);
  for (let i = 0; i < num; i++) {
    compoundCurve.addLineString(createLineString(hasZ, hasM));
  }
  if (ring) {
    compoundCurve
      .getLineString(num - 1)
      .addPoint(compoundCurve.getLineString(0).startPoint());
  }
  return compoundCurve;
};

/**
 * Create a random curve polygon
 *
 * @param hasZ
 * @param hasM
 * @returnsCurvePolygon
 */
export const createCurvePolygon = (hasZ: boolean, hasM: boolean) => {
  const curvePolygon = CurvePolygon.create(hasZ, hasM);
  const num = 1 + Math.round(Math.random() * 5);
  for (let i = 0; i < num; i++) {
    curvePolygon.addRing(createCompoundCurve(hasZ, hasM, true));
  }
  return curvePolygon;
};

/**
 * Randomly return true or false
 * @returns true or false
 */
export const coinFlip = () => Math.random() < 0.5;
