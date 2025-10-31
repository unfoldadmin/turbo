/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Fueler training certification with expiry warnings
 */
export type PatchedFuelerTrainingRequest = {
    fueler?: number;
    training?: number;
    completed_date?: string;
    expiry_date?: string;
    certified_by?: number | null;
};
