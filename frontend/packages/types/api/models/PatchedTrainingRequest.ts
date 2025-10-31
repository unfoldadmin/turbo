/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PatchedTrainingRequest = {
    training_name?: string;
    description?: string;
    /**
     * Number of days the training is valid
     */
    validity_period_days?: number;
    /**
     * Specific aircraft type (if applicable)
     */
    aircraft_type?: string | null;
};
