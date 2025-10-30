/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatusA3eEnum } from './StatusA3eEnum';
export type FuelerRequest = {
    user: number;
    fueler_name: string;
    /**
     * Name used on handheld devices
     */
    handheld_name?: string;
    status?: StatusA3eEnum;
};

