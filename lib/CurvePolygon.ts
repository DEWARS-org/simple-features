import type { LineString } from "./internal.ts";
import { Curve, SFException } from "./internal.ts";
import {
  Geometry,
  GeometryType,
  Surface,
  UnsupportedOperationException,
} from "./internal.ts";

/**
 * A planar surface defined by an exterior ring and zero or more interior ring.
 * Each ring is defined by a Curve instance.
 * @param <T> curve type
 */
export class CurvePolygon<T extends Curve = Curve> extends Surface {
  /**
   * List of rings
   */
  private _rings: T[] = [];

  /**
   * Constructor
   */
  protected constructor(
    geometryType: GeometryType,
    hasZ?: boolean,
    hasM?: boolean,
  ) {
    super(geometryType, hasZ, hasM);
    this._rings = [];
  }

  /**
   * Create a curve polygon
   */
  public static create(
    hasZ?: boolean,
    hasM?: boolean,
  ): CurvePolygon {
    return new CurvePolygon(GeometryType.CurvePolygon, hasZ, hasM);
  }

  /**
   * Create a curve polygon
   * @param rings rings
   * @returnscurve polygon
   */
  public static createFromRings(
    rings: LineString[],
  ): CurvePolygon {
    const hasZ = Geometry.hasZ(rings);
    const hasM = Geometry.hasM(rings);
    const curvePolygon = CurvePolygon.create(hasZ, hasM);
    curvePolygon.rings = rings;
    return curvePolygon;
  }

  /**
   * Create a curve polygon
   * @param ring ring
   * @returnscurve polygon
   */
  public static createFromRing(
    ring: LineString,
  ): CurvePolygon {
    const hasZ = ring.hasZ;
    const hasM = ring.hasM;
    const curvePolygon = CurvePolygon.create(hasZ, hasM);
    curvePolygon.addRing(ring);
    return curvePolygon;
  }

  /**
   * Get the rings
   * @returnsrings
   */
  public get rings(): T[] {
    return this._rings;
  }

  /**
   * Set the rings
   * @param rings rings
   */
  public set rings(rings: T[]) {
    this._rings = [];
    for (const ring of rings) {
      this.addRing(ring);
    }
  }

  /**
   * Add a ring
   * @param ring ring
   */
  public addRing(ring: T): void {
    this._rings.push(ring);
    this.updateZM(ring);
  }

  /**
   * Add rings
   * @param rings rings
   */
  public addRings(rings: T[]): void {
    for (const ring of rings) {
      this.addRing(ring);
    }
  }

  /**
   * Get the number of rings including exterior and interior
   * @returnsnumber of rings
   */
  public numRings(): number {
    return this._rings.length;
  }

  /**
   * Returns the Nth ring where the exterior ring is at 0, interior rings
   * begin at 1
   * @param n nth ring to return
   * @returnsring
   */
  public getRing(n: number): T {
    return this._rings[n];
  }

  /**
   * Get the exterior ring
   *
   * @returnsexterior ring
   */
  public getExteriorRing(): T {
    return this._rings[0];
  }

  /**
   * Get the number of interior rings
   *
   * @returnsnumber of interior rings
   */
  public numInteriorRings(): number {
    return this._rings.length - 1;
  }

  /**
   * Returns the Nth interior ring for this Polygon
   * @param n interior ring number
   * @returnsinterior ring
   */
  public getInteriorRing(n: number): T {
    return this._rings[n + 1];
  }

  /**
   * {@inheritDoc}
   */
  public copy(): Geometry {
    const curvePolygonCopy = CurvePolygon.create(
      this.hasZ,
      this.hasM,
    );
    for (const ring of this.rings) {
      const copy = ring.copy();
      if (copy instanceof Curve) {
        curvePolygonCopy.addRing(copy);
      } else {
        throw new SFException("CurvePolygon copy failed, ring is not a curve");
      }
    }
    return curvePolygonCopy;
  }

  /**
   * {@inheritDoc}
   */
  public isEmpty(): boolean {
    return this._rings.length === 0;
  }

  /**
   * {@inheritDoc}
   */
  public isSimple(): boolean {
    throw new UnsupportedOperationException(
      "Is Simple not implemented for CurvePolygon",
    );
  }

  /**
   * {@inheritDoc}
   */
  public equals(obj: CurvePolygon<T>): boolean {
    let equal = true;
    if (obj instanceof CurvePolygon) {
      if (this.numRings() === obj.numRings()) {
        for (let i = 0; i < this.numRings(); i++) {
          if (!this.getRing(i).equals(obj.getRing(i))) {
            equal = false;
            break;
          }
        }
      } else {
        equal = false;
      }
    } else {
      equal = false;
    }
    return equal;
  }
}
