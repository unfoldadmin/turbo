/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FuelTypeEnum } from './FuelTypeEnum';
/**
 * Serializer for fuel tank configuration
 */
export type FuelTankRequest = {
    tank_id: string;
    tank_name: string;
    fuel_type: FuelTypeEnum;
    capacity_gallons: string;
    min_level_inches: string;
    max_level_inches: string;
    usable_min_inches: string;
    usable_max_inches: string;
};

