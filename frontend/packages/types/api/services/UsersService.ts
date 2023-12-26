/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PatchedUserCurrent } from '../models/PatchedUserCurrent'
import type { UserChangePassword } from '../models/UserChangePassword'
import type { UserCreate } from '../models/UserCreate'
import type { UserCurrent } from '../models/UserCurrent'

import type { CancelablePromise } from '../core/CancelablePromise'
import type { BaseHttpRequest } from '../core/BaseHttpRequest'

export class UsersService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns UserCreate
   * @throws ApiError
   */
  public usersCreate(requestBody: UserCreate): CancelablePromise<UserCreate> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/users/',
      body: requestBody,
      mediaType: 'application/json'
    })
  }

  /**
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public usersChangePasswordCreate(
    requestBody: UserChangePassword
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/users/change-password/',
      body: requestBody,
      mediaType: 'application/json'
    })
  }

  /**
   * @returns void
   * @throws ApiError
   */
  public usersDeleteAccountDestroy(): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/users/delete-account/'
    })
  }

  /**
   * @returns UserCurrent
   * @throws ApiError
   */
  public usersMeRetrieve(): CancelablePromise<UserCurrent> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/users/me/'
    })
  }

  /**
   * @param requestBody
   * @returns UserCurrent
   * @throws ApiError
   */
  public usersMeUpdate(
    requestBody: UserCurrent
  ): CancelablePromise<UserCurrent> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/users/me/',
      body: requestBody,
      mediaType: 'application/json'
    })
  }

  /**
   * @param requestBody
   * @returns UserCurrent
   * @throws ApiError
   */
  public usersMePartialUpdate(
    requestBody?: PatchedUserCurrent
  ): CancelablePromise<UserCurrent> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/users/me/',
      body: requestBody,
      mediaType: 'application/json'
    })
  }
}
