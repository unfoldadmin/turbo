/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Fueler } from '../models/Fueler';
import type { FuelerRequest } from '../models/FuelerRequest';
import type { FuelerWithCertifications } from '../models/FuelerWithCertifications';
import type { PaginatedFuelerList } from '../models/PaginatedFuelerList';
import type { PatchedFuelerRequest } from '../models/PatchedFuelerRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FuelersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for fuelers
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedFuelerList
     * @throws ApiError
     */
    public fuelersList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedFuelerList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/fuelers/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for fuelers
     * @param requestBody
     * @returns Fueler
     * @throws ApiError
     */
    public fuelersCreate(
        requestBody: FuelerRequest,
    ): CancelablePromise<Fueler> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/fuelers/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuelers
     * @param id A unique integer value identifying this Fueler.
     * @returns FuelerWithCertifications
     * @throws ApiError
     */
    public fuelersRetrieve(
        id: number,
    ): CancelablePromise<FuelerWithCertifications> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/fuelers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for fuelers
     * @param id A unique integer value identifying this Fueler.
     * @param requestBody
     * @returns Fueler
     * @throws ApiError
     */
    public fuelersUpdate(
        id: number,
        requestBody: FuelerRequest,
    ): CancelablePromise<Fueler> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/fuelers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuelers
     * @param id A unique integer value identifying this Fueler.
     * @param requestBody
     * @returns Fueler
     * @throws ApiError
     */
    public fuelersPartialUpdate(
        id: number,
        requestBody?: PatchedFuelerRequest,
    ): CancelablePromise<Fueler> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/fuelers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuelers
     * @param id A unique integer value identifying this Fueler.
     * @returns void
     * @throws ApiError
     */
    public fuelersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/fuelers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get certifications for a specific fueler
     * @param id A unique integer value identifying this Fueler.
     * @returns Fueler
     * @throws ApiError
     */
    public fuelersCertificationsRetrieve(
        id: number,
    ): CancelablePromise<Fueler> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/fuelers/{id}/certifications/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get fuelers with certifications expiring within 7 days
     * @returns Fueler
     * @throws ApiError
     */
    public fuelersExpiringSoonRetrieve(): CancelablePromise<Fueler> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/fuelers/expiring_soon/',
        });
    }
}
