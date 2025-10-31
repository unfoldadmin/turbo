/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineScheduleStatusEnum } from './LineScheduleStatusEnum';
import type { ServiceTypeEnum } from './ServiceTypeEnum';
/**
 * Serializer for line service schedules
 */
export type PatchedLineScheduleRequest = {
    flight?: number | null;
    service_type?: ServiceTypeEnum;
    scheduled_time?: string;
    actual_start_time?: string | null;
    actual_end_time?: string | null;
    status?: LineScheduleStatusEnum;
    assigned_personnel?: Array<number>;
    equipment_used?: Array<number>;
    gate?: number | null;
    notes?: string;
};
