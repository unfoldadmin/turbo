/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineScheduleStatusEnum } from './LineScheduleStatusEnum';
import type { ServiceTypeEnum } from './ServiceTypeEnum';
/**
 * Serializer for line service schedules
 */
export type LineSchedule = {
    readonly id: number;
    flight?: number | null;
    readonly flight_number: string;
    service_type: ServiceTypeEnum;
    scheduled_time: string;
    actual_start_time?: string | null;
    actual_end_time?: string | null;
    status?: LineScheduleStatusEnum;
    assigned_personnel?: Array<number>;
    readonly assigned_personnel_names: string;
    equipment_used?: Array<number>;
    readonly equipment_used_names: string;
    gate?: number | null;
    readonly gate_display: string;
    notes?: string;
    readonly duration: string;
    readonly created_at: string;
    readonly modified_at: string;
};

