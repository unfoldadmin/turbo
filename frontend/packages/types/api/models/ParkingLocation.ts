/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocationTypeEnum } from './LocationTypeEnum';
/**
 * Serializer for parking locations (hangars, terminal, ramps, tie-downs)
 */
export type ParkingLocation = {
    readonly id: number;
    location_name: string;
    location_type: LocationTypeEnum;
    display_order?: number;
    is_active?: boolean;
    notes?: string;
    readonly created_at: string;
    readonly modified_at: string;
};

