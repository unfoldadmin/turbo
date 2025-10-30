/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FlightDetail } from '../models/FlightDetail';
import type { FlightList } from '../models/FlightList';
import type { FlightListRequest } from '../models/FlightListRequest';
import type { PaginatedFlightListList } from '../models/PaginatedFlightListList';
import type { PatchedFlightListRequest } from '../models/PatchedFlightListRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FlightsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for flights with filtering by status and date
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedFlightListList
     * @throws ApiError
     */
    public flightsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedFlightListList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/flights/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for flights with filtering by status and date
     * @param requestBody
     * @returns FlightList
     * @throws ApiError
     */
    public flightsCreate(
        requestBody: FlightListRequest,
    ): CancelablePromise<FlightList> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/flights/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for flights with filtering by status and date
     * @param id A unique integer value identifying this Flight.
     * @returns FlightDetail
     * @throws ApiError
     */
    public flightsRetrieve(
        id: number,
    ): CancelablePromise<FlightDetail> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/flights/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Override to add debug logging
     * @param id A unique integer value identifying this Flight.
     * @param requestBody
     * @returns FlightList
     * @throws ApiError
     */
    public flightsUpdate(
        id: number,
        requestBody: FlightListRequest,
    ): CancelablePromise<FlightList> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/flights/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Override to add debug logging
     * @param id A unique integer value identifying this Flight.
     * @param requestBody
     * @returns FlightList
     * @throws ApiError
     */
    public flightsPartialUpdate(
        id: number,
        requestBody?: PatchedFlightListRequest,
    ): CancelablePromise<FlightList> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/flights/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for flights with filtering by status and date
     * @param id A unique integer value identifying this Flight.
     * @returns void
     * @throws ApiError
     */
    public flightsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/flights/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
