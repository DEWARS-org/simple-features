import type { Geometry, GeometryType } from "../../internal.ts";

/**
 * Geometry Filter to filter included geometries and modify them during
 * construction
 */
export interface GeometryFilter {
  /**
   * Filter the geometry
   *
   * @param containingType geometry type of the geometry containing this geometry element, null if geometry is top level
   * @param geometry geometry, may be modified
   * @returns true if passes filter and geometry should be included
   */
  filter(containingType: GeometryType, geometry: Geometry): boolean;
}
