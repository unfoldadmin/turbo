/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EquipmentStatusEnum } from './EquipmentStatusEnum';
import type { EquipmentTypeEnum } from './EquipmentTypeEnum';
/**
 * Serializer for equipment inventory
 */
export type PatchedEquipmentRequest = {
    equipment_id?: string;
    equipment_name?: string;
    equipment_type?: EquipmentTypeEnum;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
    status?: EquipmentStatusEnum;
    location?: string;
    notes?: string;
    last_maintenance_date?: string | null;
    next_maintenance_date?: string | null;
};
