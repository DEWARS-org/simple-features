import type { Curve, GeometryType } from "./internal.ts";
import { GeometryCollection } from "./internal.ts";

/**
 * A restricted form of GeometryCollection where each Geometry in the collection
 * must be of type Curve.
 * @param <T> curve type
 */
export abstract class MultiCurve<T extends Curve>
  extends GeometryCollection<T> {
  /**
   * Constructor
   * @param type geometry type
   * @param hasZ has z
   * @param hasM has m
   */
  protected constructor(
    geometryType: GeometryType,
    hasZ?: boolean,
    hasM?: boolean,
  ) {
    super(geometryType, hasZ, hasM);
  }

  /**
   * Get the curves
   * @returnscurves
   */
  public getCurves(): T[] {
    return this.geometries;
  }

  /**
   * Set the curves
   * @param curves curves
   */
  public setCurves(curves: T[]): void {
    this.geometries = curves;
  }

  /**
   * Add a curve
   * @param curve curve
   */
  public addCurve(curve: T): void {
    this.addGeometry(curve);
  }

  /**
   * Add curves
   * @param curves curves
   */
  public addCurves(curves: T[]): void {
    this.addGeometries(curves);
  }

  /**
   * Get the number of curves
   * @returnsnumber of curves
   */
  public numCurves(): number {
    return this.numGeometries();
  }

  /**
   * Returns the Nth curve
   * @param n nth line curve to return
   * @returnscurve
   */
  public getCurve(n: number): T {
    return this.getGeometry(n);
  }

  /**
   * Determine if this Multi Curve is closed for each Curve (start point = end
   * point)
   *
   * @returns true if closed
   */
  public isClosed(): boolean {
    let closed = true;
    for (const curve of this.geometries) {
      if (!curve.isClosed()) {
        closed = false;
        break;
      }
    }
    return closed;
  }
}
