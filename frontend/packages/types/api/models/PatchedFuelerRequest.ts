/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatusEnum } from './StatusEnum';
export type PatchedFuelerRequest = {
    user?: number;
    fueler_name?: string;
    /**
     * Name used on handheld devices
     */
    handheld_name?: string;
    status?: StatusEnum;
};

