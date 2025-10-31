/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProgressEnum } from './ProgressEnum';
import type { QtSyncStatusEnum } from './QtSyncStatusEnum';
/**
 * List view for fuel transactions
 */
export type FuelTransactionListRequest = {
    ticket_number: string;
    flight?: number | null;
    quantity_gallons: string;
    quantity_lbs: string;
    progress?: ProgressEnum;
    qt_sync_status?: QtSyncStatusEnum;
};
