import type { Geometry } from "../lib/internal.ts";
import { GeometrySerializer } from "../lib/internal.ts";
import {
  compareGeometries,
  createCompoundCurve,
  createCurvePolygon,
  createGeometryCollection,
  createLineString,
  createMultiLineString,
  createMultiPoint,
  createMultiPolygon,
  createPoint,
  createPolygon,
} from "./SFTestUtils.ts";

function testSerializable(geometry: Geometry) {
  const json = GeometrySerializer.serialize(geometry);
  const deserializedGeometry = GeometrySerializer.deserialize(json);
  compareGeometries(geometry, deserializedGeometry);
}

Deno.test("test polygon", () => {
  testSerializable(
    createPolygon(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test line string", () => {
  testSerializable(
    createLineString(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test point", () => {
  testSerializable(
    createPoint(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test geometry collection", () => {
  testSerializable(
    createGeometryCollection(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test multi polygon", () => {
  testSerializable(
    createMultiPolygon(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test multi line string", () => {
  testSerializable(
    createMultiLineString(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test multi point", () => {
  testSerializable(
    createMultiPoint(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test curve polygon", () => {
  testSerializable(
    createCurvePolygon(Math.random() < 0.5, Math.random() < 0.5),
  );
});

Deno.test("test compound curve", () => {
  testSerializable(
    createCompoundCurve(Math.random() < 0.5, Math.random() < 0.5),
  );
});
