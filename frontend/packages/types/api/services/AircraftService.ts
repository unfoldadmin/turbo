/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Aircraft } from '../models/Aircraft';
import type { AircraftRequest } from '../models/AircraftRequest';
import type { PaginatedAircraftList } from '../models/PaginatedAircraftList';
import type { PatchedAircraftRequest } from '../models/PatchedAircraftRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AircraftService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for aircraft registry
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedAircraftList
     * @throws ApiError
     */
    public aircraftList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedAircraftList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/aircraft/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for aircraft registry
     * @param requestBody
     * @returns Aircraft
     * @throws ApiError
     */
    public aircraftCreate(
        requestBody: AircraftRequest,
    ): CancelablePromise<Aircraft> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/aircraft/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for aircraft registry
     * @param tailNumber A unique value identifying this Aircraft.
     * @returns Aircraft
     * @throws ApiError
     */
    public aircraftRetrieve(
        tailNumber: string,
    ): CancelablePromise<Aircraft> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/aircraft/{tail_number}/',
            path: {
                'tail_number': tailNumber,
            },
        });
    }
    /**
     * ViewSet for aircraft registry
     * @param tailNumber A unique value identifying this Aircraft.
     * @param requestBody
     * @returns Aircraft
     * @throws ApiError
     */
    public aircraftUpdate(
        tailNumber: string,
        requestBody: AircraftRequest,
    ): CancelablePromise<Aircraft> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/aircraft/{tail_number}/',
            path: {
                'tail_number': tailNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for aircraft registry
     * @param tailNumber A unique value identifying this Aircraft.
     * @param requestBody
     * @returns Aircraft
     * @throws ApiError
     */
    public aircraftPartialUpdate(
        tailNumber: string,
        requestBody?: PatchedAircraftRequest,
    ): CancelablePromise<Aircraft> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/aircraft/{tail_number}/',
            path: {
                'tail_number': tailNumber,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for aircraft registry
     * @param tailNumber A unique value identifying this Aircraft.
     * @returns void
     * @throws ApiError
     */
    public aircraftDestroy(
        tailNumber: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/aircraft/{tail_number}/',
            path: {
                'tail_number': tailNumber,
            },
        });
    }
}
