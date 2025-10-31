/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatedBySourceEnum } from './CreatedBySourceEnum';
import type { FlightStatusEnum } from './FlightStatusEnum';
/**
 * Serializer for flight list view with nested data
 */
export type FlightList = {
    readonly id: number;
    call_sign?: string | null;
    aircraft: string;
    readonly aircraft_type_icao: string;
    readonly aircraft_type_display: string;
    origin?: string;
    destination: string;
    arrival_time?: string | null;
    departure_time: string;
    flight_status?: FlightStatusEnum;
    location?: number | null;
    readonly location_display: string;
    services?: any;
    fuel_order_notes?: string;
    passenger_count?: number | null;
    notes?: string;
    contact_name?: string;
    contact_notes?: string;
    created_by_source?: CreatedBySourceEnum;
    readonly created_by_initials: string;
    readonly created_by_name: string;
    readonly created_by_department: string;
    readonly created_at: string;
    readonly modified_at: string;
};
