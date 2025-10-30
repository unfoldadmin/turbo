/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatusA3eEnum } from './StatusA3eEnum';
export type Fueler = {
    readonly id: number;
    user: number;
    readonly username: string;
    readonly email: string;
    fueler_name: string;
    /**
     * Name used on handheld devices
     */
    handheld_name?: string;
    status?: StatusA3eEnum;
    readonly created_at: string;
    readonly modified_at: string;
};

