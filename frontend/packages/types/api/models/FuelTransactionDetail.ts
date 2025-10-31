/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FlightList } from './FlightList';
import type { FuelerAssignment } from './FuelerAssignment';
import type { ProgressEnum } from './ProgressEnum';
import type { QtSyncStatusEnum } from './QtSyncStatusEnum';
/**
 * Detailed view for fuel transactions
 */
export type FuelTransactionDetail = {
    readonly id: number;
    ticket_number: string;
    flight?: number | null;
    readonly flight_details: FlightList;
    quantity_gallons: string;
    quantity_lbs: string;
    density: string;
    progress?: ProgressEnum;
    charge_flags?: any;
    assigned_at?: string | null;
    completed_at?: string | null;
    /**
     * QT Technologies API dispatch ID
     */
    qt_dispatch_id?: string | null;
    qt_sync_status?: QtSyncStatusEnum;
    readonly fueler_assignments: Array<FuelerAssignment>;
    readonly created_at: string;
    readonly modified_at: string;
};
