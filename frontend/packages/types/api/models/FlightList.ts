/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FlightStatusEnum } from './FlightStatusEnum';
/**
 * Serializer for flight list view with nested data
 */
export type FlightList = {
    readonly id: number;
    flight_number: string;
    aircraft?: string | null;
    readonly aircraft_display: string;
    gate?: number | null;
    readonly gate_display: string;
    arrival_time?: string | null;
    departure_time: string;
    flight_status?: FlightStatusEnum;
    destination?: string;
    readonly created_at: string;
};

