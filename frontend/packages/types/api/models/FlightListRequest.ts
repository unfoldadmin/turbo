/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FlightStatusEnum } from './FlightStatusEnum';
/**
 * Serializer for flight list view with nested data
 */
export type FlightListRequest = {
    flight_number: string;
    aircraft?: string | null;
    gate?: number | null;
    arrival_time?: string | null;
    departure_time: string;
    flight_status?: FlightStatusEnum;
    destination?: string;
};

