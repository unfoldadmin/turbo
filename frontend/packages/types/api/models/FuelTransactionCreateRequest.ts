/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for creating fuel transactions
 */
export type FuelTransactionCreateRequest = {
    ticket_number: string;
    flight?: number | null;
    quantity_gallons: string;
    quantity_lbs: string;
    density: string;
    charge_flags?: any;
};
