/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from '../models/Equipment';
import type { EquipmentRequest } from '../models/EquipmentRequest';
import type { PaginatedEquipmentList } from '../models/PaginatedEquipmentList';
import type { PatchedEquipmentRequest } from '../models/PatchedEquipmentRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EquipmentService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for equipment inventory
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedEquipmentList
     * @throws ApiError
     */
    public equipmentList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedEquipmentList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/equipment/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for equipment inventory
     * @param requestBody
     * @returns Equipment
     * @throws ApiError
     */
    public equipmentCreate(
        requestBody: EquipmentRequest,
    ): CancelablePromise<Equipment> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/equipment/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for equipment inventory
     * @param id A unique integer value identifying this Equipment.
     * @returns Equipment
     * @throws ApiError
     */
    public equipmentRetrieve(
        id: number,
    ): CancelablePromise<Equipment> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/equipment/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for equipment inventory
     * @param id A unique integer value identifying this Equipment.
     * @param requestBody
     * @returns Equipment
     * @throws ApiError
     */
    public equipmentUpdate(
        id: number,
        requestBody: EquipmentRequest,
    ): CancelablePromise<Equipment> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/equipment/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for equipment inventory
     * @param id A unique integer value identifying this Equipment.
     * @param requestBody
     * @returns Equipment
     * @throws ApiError
     */
    public equipmentPartialUpdate(
        id: number,
        requestBody?: PatchedEquipmentRequest,
    ): CancelablePromise<Equipment> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/equipment/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for equipment inventory
     * @param id A unique integer value identifying this Equipment.
     * @returns void
     * @throws ApiError
     */
    public equipmentDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/equipment/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
