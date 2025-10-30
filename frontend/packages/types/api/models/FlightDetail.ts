/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Aircraft } from './Aircraft';
import type { FlightStatusEnum } from './FlightStatusEnum';
import type { TerminalGate } from './TerminalGate';
/**
 * Detailed flight serializer with full nested objects
 */
export type FlightDetail = {
    readonly id: number;
    flight_number: string;
    aircraft?: string | null;
    readonly aircraft_details: Aircraft;
    gate?: number | null;
    readonly gate_details: TerminalGate;
    arrival_time?: string | null;
    departure_time: string;
    flight_status?: FlightStatusEnum;
    destination?: string;
    readonly fuel_transactions_count: string;
    readonly created_at: string;
    readonly modified_at: string;
};

