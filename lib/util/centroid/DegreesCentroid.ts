import type {
  CompoundCurve,
  CurvePolygon,
  Geometry,
  GeometryCollection,
  LineString,
  Polygon,
  PolyhedralSurface,
} from "../../internal.ts";

import {
  GeometryType,
  GeometryUtils,
  Point,
  SFException,
} from "../../internal.ts";

/**
 * Centroid calculations for geometries in degrees
 */
export class DegreesCentroid {
  /**
   * Geometry
   */
  private _geometry: Geometry | undefined;

  /**
   * Number of points
   */
  private _points = 0;

  /**
   * x sum
   */
  private _x = 0;

  /**
   * y sum
   */
  private _y = 0;

  /**
   * z sum
   */
  private _z = 0;

  /**
   * Create a degrees centroid
   * @returns degrees centroid
   */
  public static create(): DegreesCentroid {
    return new DegreesCentroid();
  }

  /**
   * Create a degrees centroid from a geometry
   * @param geometry geometry
   * @returns degrees centroid
   */
  public static createFromGeometry(
    geometry: Geometry,
  ): DegreesCentroid {
    const degreesCentroid = DegreesCentroid.create();
    degreesCentroid._geometry = geometry;
    return degreesCentroid;
  }

  /**
   * Get the degree geometry centroid
   * @param geometry geometry
   * @returnscentroid point
   */
  public static getCentroid(geometry: Geometry): Point {
    return DegreesCentroid.createFromGeometry(geometry).getCentroid();
  }

  /**
   * Get the centroid point
   * @returnscentroid point
   */
  public getCentroid(): Point {
    let centroid: Point;

    if (!this._geometry) {
      throw new SFException("No Geometry provided");
    }

    if (this._geometry.geometryType === GeometryType.Point) {
      centroid = this._geometry as Point;
    } else {
      this.calculate(this._geometry);

      this._x /= this._points;
      this._y /= this._points;
      this._z /= this._points;

      const centroidLongitude = Math.atan2(this._y, this._x);
      const centroidLatitude = Math.atan2(
        this._z,
        Math.sqrt(this._x * this._x + this._y * this._y),
      );

      centroid = Point.createFromXY(
        GeometryUtils.radiansToDegrees(centroidLongitude),
        GeometryUtils.radiansToDegrees(centroidLatitude),
      );
    }

    return centroid;
  }

  /**
   * Add to the centroid calculation for the Geometry
   *
   * @param geometry Geometry
   */
  private calculate(geometry: Geometry): void {
    const geometryType = geometry.geometryType;

    switch (geometryType) {
      case GeometryType.Geometry:
        throw new SFException(
          `Unexpected Geometry Type of ${geometryType} which is abstract`,
        );
      case GeometryType.Point: {
        this.calculatePoint(geometry as Point);
        break;
      }
      case GeometryType.LineString:
      case GeometryType.CircularString: {
        this.calculateLineString(geometry as LineString);
        break;
      }
      case GeometryType.Polygon:
      case GeometryType.Triangle: {
        this.calculatePolygon(geometry as Polygon);
        break;
      }
      case GeometryType.GeometryCollection:
      case GeometryType.MultiPoint:
      case GeometryType.MultiCurve:
      case GeometryType.MultiLineString:
      case GeometryType.MultiSurface:
      case GeometryType.MultiPolygon: {
        this.calculateGeometryCollection(
          geometry as GeometryCollection,
        );
        break;
      }
      case GeometryType.CompoundCurve: {
        this.calculateCompoundCurve(geometry as CompoundCurve);
        break;
      }
      case GeometryType.CurvePolygon: {
        this.calculateCurvePolygon(geometry as CurvePolygon);
        break;
      }
      case GeometryType.Curve: {
        throw new SFException(
          `Unexpected Geometry Type of ${geometryType} which is abstract`,
        );
      }
      case GeometryType.Surface: {
        throw new SFException(
          `Unexpected Geometry Type of ${geometryType} which is abstract`,
        );
      }
      case GeometryType.PolyhedralSurface:
      case GeometryType.Tin: {
        this.calculatePolyhedralSurface(geometry as PolyhedralSurface);
        break;
      }
      default:
        throw new SFException(`Geometry Type not supported: ${geometryType}`);
    }
  }

  /**
   * Add to the centroid calculation for the Point
   * @param point Point
   */
  private calculatePoint(point: Point): void {
    const latitude = GeometryUtils.degreesToRadians(point.y);
    const longitude = GeometryUtils.degreesToRadians(point.x);
    const cosLatitude = Math.cos(latitude);
    this._x += cosLatitude * Math.cos(longitude);
    this._y += cosLatitude * Math.sin(longitude);
    this._z += Math.sin(latitude);
    this._points++;
  }

  /**
   * Add to the centroid calculation for the Line String
   * @param lineString Line String
   */
  private calculateLineString(lineString: LineString): void {
    for (const point of lineString.points) {
      this.calculatePoint(point);
    }
  }

  /**
   * Add to the centroid calculation for the Polygon
   * @param polygon Polygon
   */
  private calculatePolygon(polygon: Polygon): void {
    if (polygon.numRings() > 0) {
      const exteriorRing = polygon.getExteriorRing();
      let numPoints = exteriorRing.numPoints();
      if (GeometryUtils.closedPolygonRing(exteriorRing)) {
        numPoints--;
      }
      for (let i = 0; i < numPoints; i++) {
        this.calculatePoint(exteriorRing.getPoint(i));
      }
    }
  }

  /**
   * Add to the centroid calculation for the Geometry Collection
   * @param geometryCollection Geometry Collection
   */
  private calculateGeometryCollection(
    geometryCollection: GeometryCollection,
  ) {
    for (const geometry of geometryCollection.geometries) {
      this.calculate(geometry);
    }
  }

  /**
   * Add to the centroid calculation for the Compound Curve
   * @param compoundCurve Compound Curve
   */
  private calculateCompoundCurve(compoundCurve: CompoundCurve): void {
    for (const lineString of compoundCurve.lineStrings) {
      this.calculateLineString(lineString);
    }
  }

  /**
   * Add to the centroid calculation for the Curve Polygon
   * @param curvePolygon Curve Polygon
   */
  private calculateCurvePolygon(curvePolygon: CurvePolygon): void {
    for (const ring of curvePolygon.rings) {
      this.calculate(ring);
    }
  }

  /**
   * Add to the centroid calculation for the Polyhedral Surface
   * @param polyhedralSurface Polyhedral Surface
   */
  private calculatePolyhedralSurface(
    polyhedralSurface: PolyhedralSurface,
  ): void {
    for (const polygon of polyhedralSurface.polygons) {
      this.calculatePolygon(polygon);
    }
  }
}
