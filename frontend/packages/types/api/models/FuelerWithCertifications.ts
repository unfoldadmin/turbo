/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FuelerTraining } from './FuelerTraining';
import type { StatusA3eEnum } from './StatusA3eEnum';
import type { UserList } from './UserList';
/**
 * Fueler with all certifications for detail view
 */
export type FuelerWithCertifications = {
    readonly id: number;
    user: number;
    readonly user_details: UserList;
    fueler_name: string;
    /**
     * Name used on handheld devices
     */
    handheld_name?: string;
    status?: StatusA3eEnum;
    readonly certifications: Array<FuelerTraining>;
    readonly expired_certifications_count: string;
    readonly created_at: string;
    readonly modified_at: string;
};

