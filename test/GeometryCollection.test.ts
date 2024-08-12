import { expect } from "@std/expect";
import {
  ExtendedGeometryCollection,
  GeometryCollection,
  GeometryType,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
} from "../lib/internal.ts";
import type {
  CompoundCurve,
  LineString,
  Point,
  Polygon,
} from "../lib/internal.ts";
import {
  coinFlip,
  createCompoundCurve,
  createCurvePolygon,
  createLineString,
  createPoint,
  createPolygon,
} from "./SFTestUtils.ts";

Deno.test("test multi point", () => {
  const points = [];
  for (let i = 0; i < 5; i++) {
    points.push(createPoint(coinFlip(), coinFlip()));
  }
  const geometries = [];
  geometries.push(...points);

  const multiPoint = MultiPoint.createFromPoints(points);
  const geometryCollection = GeometryCollection.createFromGeometries(
    geometries,
  );
  expect(multiPoint.numPoints()).toBe(geometryCollection.numGeometries());
  expect(multiPoint.numGeometries()).toBe(geometryCollection.numGeometries());
  for (let i = 0; i < multiPoint.numGeometries(); i++) {
    expect(
      multiPoint.getGeometry(i).equals(
        geometryCollection.getGeometry(i) as Point,
      ),
    ).toBe(true);
  }

  expect(multiPoint.isMultiPoint()).toBe(true);
  expect(multiPoint.getCollectionType()).toEqual(GeometryType.MultiPoint);

  expect(multiPoint.isMultiLineString()).toBe(false);
  expect(multiPoint.isMultiCurve()).toBe(false);
  expect(multiPoint.isMultiPolygon()).toBe(false);
  expect(multiPoint.isMultiSurface()).toBe(false);

  expect(geometryCollection.isMultiPoint()).toBe(true);

  expect(geometryCollection.getCollectionType()).toEqual(
    GeometryType.MultiPoint,
  );
  expect(geometryCollection.isMultiLineString()).toBe(false);
  expect(geometryCollection.isMultiCurve()).toBe(false);
  expect(geometryCollection.isMultiPolygon()).toBe(false);
  expect(geometryCollection.isMultiSurface()).toBe(false);

  const multiPoint2 = geometryCollection.getAsMultiPoint();
  expect(multiPoint.equals(multiPoint2)).toBe(true);
  expect(multiPoint.getAsMultiPoint().equals(multiPoint2)).toBe(true);

  const geometryCollection2 = multiPoint.getAsGeometryCollection();
  expect(geometryCollection.equals(geometryCollection2)).toBe(true);
  expect(
    geometryCollection2.equals(geometryCollection.getAsGeometryCollection()),
  ).toBe(true);
  const extendedGeometryCollection = ExtendedGeometryCollection
    .createFromGeometryCollection(
      geometryCollection,
    );

  expect(extendedGeometryCollection.geometryType).toEqual(
    GeometryType.GeometryCollection,
  );
  expect(extendedGeometryCollection.getCollectionType()).toEqual(
    GeometryType.MultiPoint,
  );
  expect(
    extendedGeometryCollection.equals(
      ExtendedGeometryCollection.createFromGeometryCollection(
        geometryCollection,
      ),
    ),
  ).toBe(true);
});

Deno.test("test multi line string", () => {
  const lineStrings = [];
  for (let i = 0; i < 5; i++) {
    lineStrings.push(createLineString(coinFlip(), coinFlip()));
  }

  const geometries = [];
  geometries.push(...lineStrings);

  const multiLineString = MultiLineString.createFromLineStrings(lineStrings);
  const geometryCollection = GeometryCollection.createFromGeometries(
    geometries,
  );

  expect(multiLineString.numLineStrings()).toEqual(
    geometryCollection.numGeometries(),
  );

  expect(multiLineString.numGeometries()).toEqual(
    geometryCollection.numGeometries(),
  );
  for (let i = 0; i < multiLineString.numGeometries(); i++) {
    expect(
      multiLineString
        .getGeometry(i)
        .equals(geometryCollection.getGeometry(i) as LineString),
    ).toBe(true);
  }

  expect(multiLineString.isMultiLineString()).toBe(true);
  expect(multiLineString.isMultiCurve()).toBe(true);
  expect(multiLineString.getCollectionType()).toBe(
    GeometryType.MultiLineString,
  );
  expect(multiLineString.isMultiPoint()).toBe(false);
  expect(multiLineString.isMultiPolygon()).toBe(false);
  expect(multiLineString.isMultiSurface()).toBe(false);

  expect(geometryCollection.isMultiLineString()).toBe(true);
  expect(geometryCollection.isMultiCurve()).toBe(true);
  expect(geometryCollection.getCollectionType()).toBe(
    GeometryType.MultiLineString,
  );
  expect(geometryCollection.isMultiPoint()).toBe(false);
  expect(geometryCollection.isMultiPolygon()).toBe(false);
  expect(geometryCollection.isMultiSurface()).toBe(false);

  const multiLineString2 = geometryCollection.getAsMultiLineString();

  expect(multiLineString.equals(multiLineString2)).toBe(true);
  expect(
    multiLineString2.equals(multiLineString.getAsMultiLineString()),
  ).toBe(true);

  const geometryCollection2 = multiLineString.getAsGeometryCollection();
  expect(geometryCollection.equals(geometryCollection2)).toBe(true);
  expect(
    geometryCollection2.equals(geometryCollection.getAsGeometryCollection()),
  ).toBe(true);

  const multiCurve = geometryCollection.getAsMultiCurve();
  for (let i = 0; i < multiLineString.numGeometries(); i++) {
    expect(
      multiLineString.getGeometry(i).equals(
        multiCurve.getGeometry(i) as LineString,
      ),
    ).toBe(true);
  }
  const multiCurve2 = multiLineString.getAsMultiCurve();
  expect(multiCurve.equals(multiCurve2)).toBe(true);

  const extendedGeometryCollection = ExtendedGeometryCollection
    .createFromGeometryCollection(
      geometryCollection,
    );
  expect(extendedGeometryCollection.geometryType).toBe(
    GeometryType.MultiCurve,
  );
  expect(extendedGeometryCollection.getCollectionType()).toBe(
    GeometryType.MultiLineString,
  );
  expect(
    extendedGeometryCollection.equals(
      ExtendedGeometryCollection.createFromGeometryCollection(
        geometryCollection,
      ),
    ),
  ).toBe(true);
});

Deno.test("test multi polygon", () => {
  const polygons = [];
  for (let i = 0; i < 5; i++) {
    polygons.push(createPolygon(coinFlip(), coinFlip()));
  }

  const geometries = [];
  geometries.push(...polygons);

  const multiPolygon = MultiPolygon.createFromPolygons(polygons);
  const geometryCollection = GeometryCollection.createFromGeometries(
    geometries,
  );

  expect(multiPolygon.numPolygons()).toBe(geometryCollection.numGeometries());
  expect(multiPolygon.numGeometries()).toBe(
    geometryCollection.numGeometries(),
  );
  for (let i = 0; i < multiPolygon.numGeometries(); i++) {
    expect(
      multiPolygon.getGeometry(i).equals(
        geometryCollection.getGeometry(i) as Polygon,
      ),
    ).toBe(true);
  }

  expect(multiPolygon.isMultiPolygon()).toBe(true);
  expect(multiPolygon.isMultiSurface()).toBe(true);
  expect(multiPolygon.getCollectionType()).toBe(GeometryType.MultiPolygon);
  expect(multiPolygon.isMultiLineString()).toBe(false);
  expect(multiPolygon.isMultiCurve()).toBe(false);
  expect(multiPolygon.isMultiPoint()).toBe(false);

  expect(geometryCollection.isMultiPolygon()).toBe(true);
  expect(geometryCollection.isMultiSurface()).toBe(true);
  expect(geometryCollection.getCollectionType()).toBe(
    GeometryType.MultiPolygon,
  );
  expect(geometryCollection.isMultiLineString()).toBe(false);
  expect(geometryCollection.isMultiCurve()).toBe(false);
  expect(geometryCollection.isMultiPoint()).toBe(false);

  const multiPolygon2 = geometryCollection.getAsMultiPolygon();
  expect(multiPolygon.equals(multiPolygon2)).toBe(true);
  expect(multiPolygon2.equals(multiPolygon.getAsMultiPolygon())).toBe(true);

  const geometryCollection2 = multiPolygon.getAsGeometryCollection();
  expect(geometryCollection.equals(geometryCollection2)).toBe(true);
  expect(
    geometryCollection2.equals(geometryCollection.getAsGeometryCollection()),
  ).toBe(true);

  const multiSurface = geometryCollection.getAsMultiSurface();
  for (let i = 0; i < multiPolygon.numGeometries(); i++) {
    expect(
      multiPolygon.getGeometry(i).equals(
        multiSurface.getGeometry(i) as Polygon,
      ),
    ).toBe(true);
  }
  const multiSurface2 = multiPolygon.getAsMultiSurface();
  multiSurface.equals(multiSurface2);

  const extendedGeometryCollection = ExtendedGeometryCollection
    .createFromGeometryCollection(
      geometryCollection,
    );
  expect(extendedGeometryCollection.geometryType).toBe(
    GeometryType.MultiSurface,
  );
  expect(extendedGeometryCollection.getCollectionType()).toBe(
    GeometryType.MultiPolygon,
  );
  expect(
    extendedGeometryCollection.equals(
      ExtendedGeometryCollection.createFromGeometryCollection(
        geometryCollection,
      ),
    ),
  ).toBe(true);
});

Deno.test("test multi curve", () => {
  const curves: (CompoundCurve | LineString)[] = [];
  for (let i = 0; i < 5; i++) {
    if (i % 2 === 0) {
      curves.push(createCompoundCurve(coinFlip(), coinFlip()));
    } else {
      curves.push(createLineString(coinFlip(), coinFlip()));
    }
  }

  const geometries = [];
  geometries.push(...curves);

  const multiCurve = GeometryCollection.createFromGeometries(curves);
  const geometryCollection = GeometryCollection.createFromGeometries(
    geometries,
  );

  expect(multiCurve.numGeometries()).toBe(geometryCollection.numGeometries());
  for (let i = 0; i < multiCurve.numGeometries(); i++) {
    expect(
      multiCurve.getGeometry(i).equals(geometryCollection.getGeometry(i)),
    ).toBe(true);
  }

  expect(multiCurve.isMultiCurve()).toBe(true);
  expect(multiCurve.getCollectionType()).toBe(GeometryType.MultiCurve);
  expect(multiCurve.isMultiSurface()).toBe(false);
  expect(multiCurve.isMultiLineString()).toBe(false);
  expect(multiCurve.isMultiPolygon()).toBe(false);
  expect(multiCurve.isMultiPoint()).toBe(false);

  expect(geometryCollection.isMultiCurve()).toBe(true);
  expect(geometryCollection.getCollectionType()).toBe(
    GeometryType.MultiCurve,
  );
  expect(geometryCollection.isMultiPolygon()).toBe(false);
  expect(geometryCollection.isMultiLineString()).toBe(false);
  expect(geometryCollection.isMultiSurface()).toBe(false);
  expect(geometryCollection.isMultiPoint()).toBe(false);

  const multiCurve2 = geometryCollection.getAsMultiCurve();
  expect(multiCurve.equals(multiCurve2)).toBe(true);
  expect(multiCurve2.equals(multiCurve.getAsMultiCurve())).toBe(true);

  const geometryCollection2 = multiCurve.getAsGeometryCollection();
  expect(geometryCollection.equals(geometryCollection2)).toBe(true);
  expect(
    geometryCollection2.equals(geometryCollection.getAsGeometryCollection()),
  ).toBe(true);

  const extendedGeometryCollection = ExtendedGeometryCollection
    .createFromGeometryCollection(
      geometryCollection,
    );
  const extendedGeometryCollection2 = ExtendedGeometryCollection
    .createFromGeometryCollection(
      multiCurve,
    );
  expect(extendedGeometryCollection.geometryType).toBe(
    GeometryType.MultiCurve,
  );
  expect(extendedGeometryCollection2.geometryType).toBe(
    GeometryType.MultiCurve,
  );
  expect(extendedGeometryCollection.getCollectionType()).toBe(
    GeometryType.MultiCurve,
  );
  expect(extendedGeometryCollection2.getCollectionType()).toBe(
    GeometryType.MultiCurve,
  );
  expect(
    extendedGeometryCollection.equals(
      ExtendedGeometryCollection.createFromGeometryCollection(
        geometryCollection,
      ),
    ),
  ).toBe(true);
  expect(extendedGeometryCollection.equals(extendedGeometryCollection2)).toBe(
    true,
  );
});

Deno.test("test multi surface", () => {
  const surfaces = [];
  for (let i = 0; i < 5; i++) {
    if (i % 2 === 0) {
      surfaces.push(createCurvePolygon(coinFlip(), coinFlip()));
    } else {
      surfaces.push(createPolygon(coinFlip(), coinFlip()));
    }
  }

  const geometries = [];
  geometries.push(...surfaces);

  const multiSurface = GeometryCollection.createFromGeometries(surfaces);
  const geometryCollection = GeometryCollection.createFromGeometries(
    geometries,
  );

  expect(multiSurface.numGeometries()).toBe(
    geometryCollection.numGeometries(),
  );
  for (let i = 0; i < multiSurface.numGeometries(); i++) {
    expect(
      multiSurface.getGeometry(i).equals(geometryCollection.getGeometry(i)),
    ).toBe(true);
  }
  expect(multiSurface.isMultiSurface()).toBe(true);
  expect(multiSurface.getCollectionType()).toBe(GeometryType.MultiSurface);
  expect(multiSurface.isMultiCurve()).toBe(false);
  expect(multiSurface.isMultiLineString()).toBe(false);
  expect(multiSurface.isMultiPolygon()).toBe(false);
  expect(multiSurface.isMultiPoint()).toBe(false);

  expect(geometryCollection.isMultiSurface()).toBe(true);
  expect(geometryCollection.getCollectionType()).toBe(
    GeometryType.MultiSurface,
  );
  expect(geometryCollection.isMultiPolygon()).toBe(false);
  expect(geometryCollection.isMultiLineString()).toBe(false);
  expect(geometryCollection.isMultiCurve()).toBe(false);
  expect(geometryCollection.isMultiPoint()).toBe(false);

  const multiSurface2 = geometryCollection.getAsMultiSurface();
  expect(multiSurface.equals(multiSurface2)).toBe(true);
  expect(multiSurface2.equals(multiSurface.getAsMultiSurface())).toBe(true);

  const geometryCollection2 = multiSurface.getAsGeometryCollection();
  expect(geometryCollection.equals(geometryCollection2)).toBe(true);
  expect(
    geometryCollection2.equals(geometryCollection.getAsGeometryCollection()),
  ).toBe(true);

  const extendedGeometryCollection = ExtendedGeometryCollection
    .createFromGeometryCollection(
      geometryCollection,
    );
  const extendedGeometryCollection2 = ExtendedGeometryCollection
    .createFromGeometryCollection(
      multiSurface,
    );
  expect(extendedGeometryCollection.geometryType).toBe(
    GeometryType.MultiSurface,
  );
  expect(extendedGeometryCollection2.geometryType).toBe(
    GeometryType.MultiSurface,
  );
  expect(extendedGeometryCollection.getCollectionType()).toBe(
    GeometryType.MultiSurface,
  );
  expect(extendedGeometryCollection2.getCollectionType()).toBe(
    GeometryType.MultiSurface,
  );
  expect(
    extendedGeometryCollection.equals(
      ExtendedGeometryCollection.createFromGeometryCollection(
        geometryCollection,
      ),
    ),
  ).toBe(true);
  expect(extendedGeometryCollection.equals(extendedGeometryCollection2)).toBe(
    true,
  );
});
