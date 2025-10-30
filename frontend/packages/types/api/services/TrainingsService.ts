/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedTrainingList } from '../models/PaginatedTrainingList';
import type { PatchedTrainingRequest } from '../models/PatchedTrainingRequest';
import type { Training } from '../models/Training';
import type { TrainingRequest } from '../models/TrainingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TrainingsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for training courses
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedTrainingList
     * @throws ApiError
     */
    public trainingsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedTrainingList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/trainings/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for training courses
     * @param requestBody
     * @returns Training
     * @throws ApiError
     */
    public trainingsCreate(
        requestBody: TrainingRequest,
    ): CancelablePromise<Training> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/trainings/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for training courses
     * @param id A unique integer value identifying this Training.
     * @returns Training
     * @throws ApiError
     */
    public trainingsRetrieve(
        id: number,
    ): CancelablePromise<Training> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/trainings/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for training courses
     * @param id A unique integer value identifying this Training.
     * @param requestBody
     * @returns Training
     * @throws ApiError
     */
    public trainingsUpdate(
        id: number,
        requestBody: TrainingRequest,
    ): CancelablePromise<Training> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/trainings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for training courses
     * @param id A unique integer value identifying this Training.
     * @param requestBody
     * @returns Training
     * @throws ApiError
     */
    public trainingsPartialUpdate(
        id: number,
        requestBody?: PatchedTrainingRequest,
    ): CancelablePromise<Training> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/trainings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for training courses
     * @param id A unique integer value identifying this Training.
     * @returns void
     * @throws ApiError
     */
    public trainingsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/trainings/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
