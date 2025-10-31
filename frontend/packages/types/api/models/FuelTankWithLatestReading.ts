/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FuelTypeEnum } from './FuelTypeEnum';
/**
 * Serializer for fuel tank with latest reading and calculated percentage
 */
export type FuelTankWithLatestReading = {
    tank_id: string;
    tank_name: string;
    fuel_type: FuelTypeEnum;
    capacity_gallons: string;
    usable_min_inches: string;
    usable_max_inches: string;
    readonly latest_reading: string;
    readonly current_level_percentage: string;
    readonly status: string;
};
