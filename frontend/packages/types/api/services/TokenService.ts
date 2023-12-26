/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TokenObtainPair } from '../models/TokenObtainPair'
import type { TokenRefresh } from '../models/TokenRefresh'

import type { CancelablePromise } from '../core/CancelablePromise'
import type { BaseHttpRequest } from '../core/BaseHttpRequest'

export class TokenService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Takes a set of user credentials and returns an access and refresh JSON web
   * token pair to prove the authentication of those credentials.
   * @param requestBody
   * @returns TokenObtainPair
   * @throws ApiError
   */
  public tokenCreate(
    requestBody: TokenObtainPair
  ): CancelablePromise<TokenObtainPair> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/token/',
      body: requestBody,
      mediaType: 'application/json'
    })
  }

  /**
   * Takes a refresh type JSON web token and returns an access type JSON web
   * token if the refresh token is valid.
   * @param requestBody
   * @returns TokenRefresh
   * @throws ApiError
   */
  public tokenRefreshCreate(
    requestBody: TokenRefresh
  ): CancelablePromise<TokenRefresh> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/token/refresh/',
      body: requestBody,
      mediaType: 'application/json'
    })
  }
}
