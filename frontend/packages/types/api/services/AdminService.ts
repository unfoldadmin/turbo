/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedUserListList } from '../models/PaginatedUserListList';
import type { PatchedUserListRequest } from '../models/PatchedUserListRequest';
import type { UserList } from '../models/UserList';
import type { UserListRequest } from '../models/UserListRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * ViewSet for user management (admin only)
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedUserListList
     * @throws ApiError
     */
    public adminUsersList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedUserListList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/users/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for user management (admin only)
     * @param requestBody
     * @returns UserList
     * @throws ApiError
     */
    public adminUsersCreate(
        requestBody: UserListRequest,
    ): CancelablePromise<UserList> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/users/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for user management (admin only)
     * @param id A unique integer value identifying this User.
     * @returns UserList
     * @throws ApiError
     */
    public adminUsersRetrieve(
        id: number,
    ): CancelablePromise<UserList> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/users/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for user management (admin only)
     * @param id A unique integer value identifying this User.
     * @param requestBody
     * @returns UserList
     * @throws ApiError
     */
    public adminUsersUpdate(
        id: number,
        requestBody: UserListRequest,
    ): CancelablePromise<UserList> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/users/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for user management (admin only)
     * @param id A unique integer value identifying this User.
     * @param requestBody
     * @returns UserList
     * @throws ApiError
     */
    public adminUsersPartialUpdate(
        id: number,
        requestBody?: PatchedUserListRequest,
    ): CancelablePromise<UserList> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/users/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for user management (admin only)
     * @param id A unique integer value identifying this User.
     * @returns void
     * @throws ApiError
     */
    public adminUsersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/users/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
