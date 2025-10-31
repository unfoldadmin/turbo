/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedTerminalGateList } from '../models/PaginatedTerminalGateList';
import type { PatchedTerminalGateRequest } from '../models/PatchedTerminalGateRequest';
import type { TerminalGate } from '../models/TerminalGate';
import type { TerminalGateRequest } from '../models/TerminalGateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class GatesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for terminal gates (DEPRECATED - use ParkingLocationViewSet)
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedTerminalGateList
     * @throws ApiError
     */
    public gatesList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedTerminalGateList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/gates/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for terminal gates (DEPRECATED - use ParkingLocationViewSet)
     * @param requestBody
     * @returns TerminalGate
     * @throws ApiError
     */
    public gatesCreate(
        requestBody: TerminalGateRequest,
    ): CancelablePromise<TerminalGate> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/gates/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for terminal gates (DEPRECATED - use ParkingLocationViewSet)
     * @param id A unique integer value identifying this Terminal Gate.
     * @returns TerminalGate
     * @throws ApiError
     */
    public gatesRetrieve(
        id: number,
    ): CancelablePromise<TerminalGate> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/gates/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for terminal gates (DEPRECATED - use ParkingLocationViewSet)
     * @param id A unique integer value identifying this Terminal Gate.
     * @param requestBody
     * @returns TerminalGate
     * @throws ApiError
     */
    public gatesUpdate(
        id: number,
        requestBody: TerminalGateRequest,
    ): CancelablePromise<TerminalGate> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/gates/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for terminal gates (DEPRECATED - use ParkingLocationViewSet)
     * @param id A unique integer value identifying this Terminal Gate.
     * @param requestBody
     * @returns TerminalGate
     * @throws ApiError
     */
    public gatesPartialUpdate(
        id: number,
        requestBody?: PatchedTerminalGateRequest,
    ): CancelablePromise<TerminalGate> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/gates/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for terminal gates (DEPRECATED - use ParkingLocationViewSet)
     * @param id A unique integer value identifying this Terminal Gate.
     * @returns void
     * @throws ApiError
     */
    public gatesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/gates/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
