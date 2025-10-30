/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Aircraft } from './Aircraft';
import type { CreatedBySourceEnum } from './CreatedBySourceEnum';
import type { FlightStatusEnum } from './FlightStatusEnum';
import type { ParkingLocation } from './ParkingLocation';
import type { UserCurrent } from './UserCurrent';
/**
 * Detailed flight serializer with full nested objects
 */
export type FlightDetail = {
    readonly id: number;
    call_sign?: string | null;
    aircraft: string;
    readonly aircraft_details: Aircraft;
    origin?: string;
    destination: string;
    arrival_time?: string | null;
    departure_time: string;
    flight_status?: FlightStatusEnum;
    location?: number | null;
    readonly location_details: ParkingLocation;
    services?: any;
    fuel_order_notes?: string;
    passenger_count?: number | null;
    notes?: string;
    contact_name?: string;
    contact_notes?: string;
    created_by?: number;
    readonly created_by_details: UserCurrent;
    created_by_source?: CreatedBySourceEnum;
    readonly fuel_transactions_count: string;
    readonly created_at: string;
    readonly modified_at: string;
};

