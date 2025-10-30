/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FuelTank } from '../models/FuelTank';
import type { FuelTankRequest } from '../models/FuelTankRequest';
import type { PaginatedFuelTankWithLatestReadingList } from '../models/PaginatedFuelTankWithLatestReadingList';
import type { PatchedFuelTankRequest } from '../models/PatchedFuelTankRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TanksService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for fuel tanks.
     * List action includes latest readings and status.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedFuelTankWithLatestReadingList
     * @throws ApiError
     */
    public tanksList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedFuelTankWithLatestReadingList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/tanks/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for fuel tanks.
     * List action includes latest readings and status.
     * @param requestBody
     * @returns FuelTank
     * @throws ApiError
     */
    public tanksCreate(
        requestBody: FuelTankRequest,
    ): CancelablePromise<FuelTank> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/tanks/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuel tanks.
     * List action includes latest readings and status.
     * @param tankId A unique value identifying this Fuel Tank.
     * @returns FuelTank
     * @throws ApiError
     */
    public tanksRetrieve(
        tankId: string,
    ): CancelablePromise<FuelTank> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/tanks/{tank_id}/',
            path: {
                'tank_id': tankId,
            },
        });
    }
    /**
     * ViewSet for fuel tanks.
     * List action includes latest readings and status.
     * @param tankId A unique value identifying this Fuel Tank.
     * @param requestBody
     * @returns FuelTank
     * @throws ApiError
     */
    public tanksUpdate(
        tankId: string,
        requestBody: FuelTankRequest,
    ): CancelablePromise<FuelTank> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/tanks/{tank_id}/',
            path: {
                'tank_id': tankId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuel tanks.
     * List action includes latest readings and status.
     * @param tankId A unique value identifying this Fuel Tank.
     * @param requestBody
     * @returns FuelTank
     * @throws ApiError
     */
    public tanksPartialUpdate(
        tankId: string,
        requestBody?: PatchedFuelTankRequest,
    ): CancelablePromise<FuelTank> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/tanks/{tank_id}/',
            path: {
                'tank_id': tankId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuel tanks.
     * List action includes latest readings and status.
     * @param tankId A unique value identifying this Fuel Tank.
     * @returns void
     * @throws ApiError
     */
    public tanksDestroy(
        tankId: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/tanks/{tank_id}/',
            path: {
                'tank_id': tankId,
            },
        });
    }
    /**
     * Get historical readings for a specific tank
     * @param tankId A unique value identifying this Fuel Tank.
     * @returns FuelTank
     * @throws ApiError
     */
    public tanksReadingsRetrieve(
        tankId: string,
    ): CancelablePromise<FuelTank> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/tanks/{tank_id}/readings/',
            path: {
                'tank_id': tankId,
            },
        });
    }
}
