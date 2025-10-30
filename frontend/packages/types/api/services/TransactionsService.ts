/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FuelTransactionCreate } from '../models/FuelTransactionCreate';
import type { FuelTransactionCreateRequest } from '../models/FuelTransactionCreateRequest';
import type { FuelTransactionDetail } from '../models/FuelTransactionDetail';
import type { FuelTransactionList } from '../models/FuelTransactionList';
import type { FuelTransactionListRequest } from '../models/FuelTransactionListRequest';
import type { PaginatedFuelTransactionListList } from '../models/PaginatedFuelTransactionListList';
import type { PatchedFuelTransactionListRequest } from '../models/PatchedFuelTransactionListRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TransactionsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for fuel transactions with assignment management
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedFuelTransactionListList
     * @throws ApiError
     */
    public transactionsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedFuelTransactionListList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/transactions/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for fuel transactions with assignment management
     * @param requestBody
     * @returns FuelTransactionCreate
     * @throws ApiError
     */
    public transactionsCreate(
        requestBody: FuelTransactionCreateRequest,
    ): CancelablePromise<FuelTransactionCreate> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/transactions/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuel transactions with assignment management
     * @param id A unique integer value identifying this Fuel Transaction.
     * @returns FuelTransactionDetail
     * @throws ApiError
     */
    public transactionsRetrieve(
        id: number,
    ): CancelablePromise<FuelTransactionDetail> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/transactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for fuel transactions with assignment management
     * @param id A unique integer value identifying this Fuel Transaction.
     * @param requestBody
     * @returns FuelTransactionList
     * @throws ApiError
     */
    public transactionsUpdate(
        id: number,
        requestBody: FuelTransactionListRequest,
    ): CancelablePromise<FuelTransactionList> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/transactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuel transactions with assignment management
     * @param id A unique integer value identifying this Fuel Transaction.
     * @param requestBody
     * @returns FuelTransactionList
     * @throws ApiError
     */
    public transactionsPartialUpdate(
        id: number,
        requestBody?: PatchedFuelTransactionListRequest,
    ): CancelablePromise<FuelTransactionList> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/transactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for fuel transactions with assignment management
     * @param id A unique integer value identifying this Fuel Transaction.
     * @returns void
     * @throws ApiError
     */
    public transactionsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/transactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Assign a fueler to this transaction
     * @param id A unique integer value identifying this Fuel Transaction.
     * @param requestBody
     * @returns FuelTransactionList
     * @throws ApiError
     */
    public transactionsAssignFuelerCreate(
        id: number,
        requestBody: FuelTransactionListRequest,
    ): CancelablePromise<FuelTransactionList> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/transactions/{id}/assign_fueler/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove a fueler from this transaction
     * @param id A unique integer value identifying this Fuel Transaction.
     * @param requestBody
     * @returns FuelTransactionList
     * @throws ApiError
     */
    public transactionsRemoveFuelerCreate(
        id: number,
        requestBody: FuelTransactionListRequest,
    ): CancelablePromise<FuelTransactionList> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/transactions/{id}/remove_fueler/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update transaction progress status
     * @param id A unique integer value identifying this Fuel Transaction.
     * @param requestBody
     * @returns FuelTransactionList
     * @throws ApiError
     */
    public transactionsUpdateProgressCreate(
        id: number,
        requestBody: FuelTransactionListRequest,
    ): CancelablePromise<FuelTransactionList> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/transactions/{id}/update_progress/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
