import { LineString, Point, Polygon, ShamosHoey } from "../lib/internal.ts";
import { expect } from "@std/expect";

Deno.test("test large simple", () => {
  const increment = 0.01;
  const radius = 1250;
  let x = -radius + increment;
  let y = 0;

  const points: Point[] = [];

  while (x <= radius) {
    if (x <= 0) {
      y -= increment;
    } else {
      y += increment;
    }
    points.push(Point.createFromXY(x, y));
    x += increment;
  }

  x = radius - increment;
  while (x >= -radius) {
    if (x >= 0) {
      y += increment;
    } else {
      y -= increment;
    }
    points.push(Point.createFromXY(x, y));
    x -= increment;
  }

  expect(ShamosHoey.simplePolygonPoints(points)).toBe(true);
  expect(
    ShamosHoey.simplePolygonLineString(LineString.createFromPoints(points)),
  ).toBe(
    true,
  );
  expect(
    ShamosHoey.simplePolygon(
      Polygon.createFromLineString(LineString.createFromPoints(points)),
    ),
  ).toBe(
    true,
  );
  expect(LineString.createFromPoints(points).isSimple()).toBe(true);
  expect(
    Polygon.createFromLineString(LineString.createFromPoints(points))
      .isSimple(),
  ).toBe(
    true,
  );
  expect(points.length).toEqual(Math.round((radius / increment) * 4));
});
