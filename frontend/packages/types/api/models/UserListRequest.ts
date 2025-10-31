/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
/**
 * Serializer for listing users (admin view)
 */
export type UserListRequest = {
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: RoleEnum;
    is_active_fueler?: boolean;
    /**
     * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
     */
    is_active?: boolean;
};
