/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedParkingLocationList } from '../models/PaginatedParkingLocationList';
import type { ParkingLocation } from '../models/ParkingLocation';
import type { ParkingLocationRequest } from '../models/ParkingLocationRequest';
import type { PatchedParkingLocationRequest } from '../models/PatchedParkingLocationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ParkingLocationsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for managing parking locations.
     *
     * list: Get all parking locations (active by default)
     * retrieve: Get specific parking location
     * create: Create new parking location
     * update: Update parking location
     * destroy: Soft delete (set display_order to 0)
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedParkingLocationList
     * @throws ApiError
     */
    public parkingLocationsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedParkingLocationList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/parking-locations/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for managing parking locations.
     *
     * list: Get all parking locations (active by default)
     * retrieve: Get specific parking location
     * create: Create new parking location
     * update: Update parking location
     * destroy: Soft delete (set display_order to 0)
     * @param requestBody
     * @returns ParkingLocation
     * @throws ApiError
     */
    public parkingLocationsCreate(
        requestBody: ParkingLocationRequest,
    ): CancelablePromise<ParkingLocation> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/parking-locations/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing parking locations.
     *
     * list: Get all parking locations (active by default)
     * retrieve: Get specific parking location
     * create: Create new parking location
     * update: Update parking location
     * destroy: Soft delete (set display_order to 0)
     * @param id A unique integer value identifying this Parking Location.
     * @returns ParkingLocation
     * @throws ApiError
     */
    public parkingLocationsRetrieve(
        id: number,
    ): CancelablePromise<ParkingLocation> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/parking-locations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for managing parking locations.
     *
     * list: Get all parking locations (active by default)
     * retrieve: Get specific parking location
     * create: Create new parking location
     * update: Update parking location
     * destroy: Soft delete (set display_order to 0)
     * @param id A unique integer value identifying this Parking Location.
     * @param requestBody
     * @returns ParkingLocation
     * @throws ApiError
     */
    public parkingLocationsUpdate(
        id: number,
        requestBody: ParkingLocationRequest,
    ): CancelablePromise<ParkingLocation> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/parking-locations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing parking locations.
     *
     * list: Get all parking locations (active by default)
     * retrieve: Get specific parking location
     * create: Create new parking location
     * update: Update parking location
     * destroy: Soft delete (set display_order to 0)
     * @param id A unique integer value identifying this Parking Location.
     * @param requestBody
     * @returns ParkingLocation
     * @throws ApiError
     */
    public parkingLocationsPartialUpdate(
        id: number,
        requestBody?: PatchedParkingLocationRequest,
    ): CancelablePromise<ParkingLocation> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/parking-locations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing parking locations.
     *
     * list: Get all parking locations (active by default)
     * retrieve: Get specific parking location
     * create: Create new parking location
     * update: Update parking location
     * destroy: Soft delete (set display_order to 0)
     * @param id A unique integer value identifying this Parking Location.
     * @returns void
     * @throws ApiError
     */
    public parkingLocationsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/parking-locations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get only active parking locations
     * @returns ParkingLocation
     * @throws ApiError
     */
    public parkingLocationsActiveRetrieve(): CancelablePromise<ParkingLocation> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/parking-locations/active/',
        });
    }
    /**
     * Group parking locations by airport
     * @returns ParkingLocation
     * @throws ApiError
     */
    public parkingLocationsByAirportRetrieve(): CancelablePromise<ParkingLocation> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/parking-locations/by_airport/',
        });
    }
}
