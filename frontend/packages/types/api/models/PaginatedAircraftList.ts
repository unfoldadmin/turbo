/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Aircraft } from './Aircraft';
export type PaginatedAircraftList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Aircraft>;
};
