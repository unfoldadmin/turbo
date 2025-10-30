/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedTankLevelReadingList } from '../models/PaginatedTankLevelReadingList';
import type { TankLevelReading } from '../models/TankLevelReading';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TankReadingsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Read-only ViewSet for tank level readings.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @returns PaginatedTankLevelReadingList
     * @throws ApiError
     */
    public tankReadingsList(
        ordering?: string,
        page?: number,
    ): CancelablePromise<PaginatedTankLevelReadingList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/tank-readings/',
            query: {
                'ordering': ordering,
                'page': page,
            },
        });
    }
    /**
     * Read-only ViewSet for tank level readings.
     * @param id A unique integer value identifying this Tank Level Reading.
     * @returns TankLevelReading
     * @throws ApiError
     */
    public tankReadingsRetrieve(
        id: number,
    ): CancelablePromise<TankLevelReading> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/tank-readings/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
