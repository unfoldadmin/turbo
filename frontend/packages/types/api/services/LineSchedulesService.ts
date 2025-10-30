/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineSchedule } from '../models/LineSchedule';
import type { LineScheduleRequest } from '../models/LineScheduleRequest';
import type { PaginatedLineScheduleList } from '../models/PaginatedLineScheduleList';
import type { PatchedLineScheduleRequest } from '../models/PatchedLineScheduleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LineSchedulesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for line service schedules
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedLineScheduleList
     * @throws ApiError
     */
    public lineSchedulesList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedLineScheduleList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/line-schedules/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for line service schedules
     * @param requestBody
     * @returns LineSchedule
     * @throws ApiError
     */
    public lineSchedulesCreate(
        requestBody: LineScheduleRequest,
    ): CancelablePromise<LineSchedule> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/line-schedules/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for line service schedules
     * @param id A unique integer value identifying this Line Schedule.
     * @returns LineSchedule
     * @throws ApiError
     */
    public lineSchedulesRetrieve(
        id: number,
    ): CancelablePromise<LineSchedule> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/line-schedules/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for line service schedules
     * @param id A unique integer value identifying this Line Schedule.
     * @param requestBody
     * @returns LineSchedule
     * @throws ApiError
     */
    public lineSchedulesUpdate(
        id: number,
        requestBody: LineScheduleRequest,
    ): CancelablePromise<LineSchedule> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/line-schedules/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for line service schedules
     * @param id A unique integer value identifying this Line Schedule.
     * @param requestBody
     * @returns LineSchedule
     * @throws ApiError
     */
    public lineSchedulesPartialUpdate(
        id: number,
        requestBody?: PatchedLineScheduleRequest,
    ): CancelablePromise<LineSchedule> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/line-schedules/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for line service schedules
     * @param id A unique integer value identifying this Line Schedule.
     * @returns void
     * @throws ApiError
     */
    public lineSchedulesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/line-schedules/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mark service as completed
     * @param id A unique integer value identifying this Line Schedule.
     * @param requestBody
     * @returns LineSchedule
     * @throws ApiError
     */
    public lineSchedulesCompleteServiceCreate(
        id: number,
        requestBody: LineScheduleRequest,
    ): CancelablePromise<LineSchedule> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/line-schedules/{id}/complete_service/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Mark service as started
     * @param id A unique integer value identifying this Line Schedule.
     * @param requestBody
     * @returns LineSchedule
     * @throws ApiError
     */
    public lineSchedulesStartServiceCreate(
        id: number,
        requestBody: LineScheduleRequest,
    ): CancelablePromise<LineSchedule> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/line-schedules/{id}/start_service/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
