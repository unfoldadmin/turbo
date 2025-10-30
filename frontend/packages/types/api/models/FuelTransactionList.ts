/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProgressEnum } from './ProgressEnum';
import type { QtSyncStatusEnum } from './QtSyncStatusEnum';
/**
 * List view for fuel transactions
 */
export type FuelTransactionList = {
    readonly id: number;
    ticket_number: string;
    flight?: number | null;
    readonly flight_number: string;
    quantity_gallons: string;
    quantity_lbs: string;
    progress?: ProgressEnum;
    readonly assigned_fuelers: string;
    qt_sync_status?: QtSyncStatusEnum;
    readonly created_at: string;
};

