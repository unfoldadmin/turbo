/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
export type PatchedUserCurrentRequest = {
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: RoleEnum;
    phone_number?: string;
    employee_id?: string | null;
    is_active_fueler?: boolean;
};
