/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatedBySourceEnum } from './CreatedBySourceEnum';
import type { FlightStatusEnum } from './FlightStatusEnum';
/**
 * Serializer for flight list view with nested data
 */
export type FlightListRequest = {
    call_sign?: string | null;
    aircraft: string;
    origin?: string;
    destination: string;
    arrival_time?: string | null;
    departure_time: string;
    flight_status?: FlightStatusEnum;
    location?: number | null;
    services?: any;
    fuel_order_notes?: string;
    passenger_count?: number | null;
    notes?: string;
    contact_name?: string;
    contact_notes?: string;
    created_by_source?: CreatedBySourceEnum;
};

