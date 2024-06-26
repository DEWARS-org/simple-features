import {
  FiniteFilterType,
  GeometryType,
  Point,
  SFException,
} from "../../internal.ts";
import type { Geometry, GeometryFilter } from "../../internal.ts";

/**
 * Point filter for finite checks on x and y properties, optionally filter on z
 * and m properties and non finite values (NaN or infinity)
 */
export class PointFiniteFilter implements GeometryFilter {
  /**
   * Finite Filter type
   */
  private _type: FiniteFilterType = FiniteFilterType.Finite;

  /**
   * Include z values in filtering
   */
  _filterZ = false;

  /**
   * Include m values in filtering
   */
  _filterM = false;

  /**
   * Default Constructor, filter on x and y, allowing only finite values
   */
  public constructor(type: FiniteFilterType, filterZ = false, filterM = false) {
    this.setType(type);
    this.setFilterZ(filterZ);
    this.setFilterM(filterM);
  }

  /**
   * Get the finite filter type
   *
   * @returnsfinite filter type
   */
  public getType(): FiniteFilterType {
    return this._type;
  }

  /**
   * Set the finite filter type, null defaults to
   * {@link FiniteFilterType#FINITE}
   *
   * @param type finite filter type
   */
  public setType(type: FiniteFilterType): void {
    this._type = type;
  }

  /**
   * Is filtering for z values enabled?
   *
   * @returns true if z filtering
   */
  public isFilterZ(): boolean {
    return this._filterZ;
  }

  /**
   * Set the z value filtering mode
   *
   * @param filterZ true to z filter
   */
  public setFilterZ(filterZ: boolean): void {
    this._filterZ = filterZ;
  }

  /**
   * Is filtering for m values enabled?
   *
   * @returns true if m filtering
   */
  public isFilterM(): boolean {
    return this._filterM;
  }

  /**
   * Set the m value filtering mode
   *
   * @param filterM true to m filter
   */
  public setFilterM(filterM: boolean): void {
    this._filterM = filterM;
  }

  /**
   * {@inheritDoc}
   */
  public filter(containingType: GeometryType, geometry: Geometry): boolean {
    return (
      geometry.geometryType !== GeometryType.Point ||
      !(geometry instanceof Point) ||
      this.filterPoint(geometry as Point)
    );
  }

  /**
   * Filter the point
   *
   * @param point point
   * @returns true if passes filter and point should be included
   */
  private filterPoint(point: Point): boolean {
    return (
      this.filterValue(point.x) &&
      this.filterValue(point.y) &&
      this.filterZ(point) &&
      this.filterM(point)
    );
  }

  /**
   * Filter the double value
   * @param value double value
   * @return
   */
  private filterValue(value: number): boolean {
    let passes: boolean;
    switch (this._type) {
      case FiniteFilterType.Finite: {
        passes = Number.isFinite(value);
        break;
      }
      case FiniteFilterType.FiniteAndInfinite: {
        passes = !Number.isNaN(value);
        break;
      }
      case FiniteFilterType.FiniteAndNan: {
        passes = Number.isFinite(value) || Number.isNaN(value);
        break;
      }
      default:
        throw new SFException(`Unsupported filter type: ${this._type}`);
    }
    return passes;
  }

  /**
   * Filter the Z value
   *
   * @param point point
   * @returns true if passes
   */
  private filterZ(point: Point): boolean {
    if (point.z === undefined) {
      throw new SFException("Point does not have z value");
    }
    return !(this._filterZ && point.hasZ) || this.filterValue(point.z);
  }

  /**
   * Filter the M value
   *
   * @param point point
   * @returns true if passes
   */
  private filterM(point: Point): boolean {
    if (point.m === undefined) {
      throw new SFException("Point does not have m value");
    }
    return !(this._filterM && point.hasM) || this.filterValue(point.m);
  }
}
