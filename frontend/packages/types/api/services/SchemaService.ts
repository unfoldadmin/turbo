/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import type { BaseHttpRequest } from '../core/BaseHttpRequest'

export class SchemaService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * OpenApi3 schema for this API. Format can be selected via content negotiation.
   *
   * - YAML: application/vnd.oai.openapi
   * - JSON: application/vnd.oai.openapi+json
   * @param format
   * @param lang
   * @returns any
   * @throws ApiError
   */
  public schemaRetrieve(
    format?: 'json' | 'yaml',
    lang?:
      | 'af'
      | 'ar'
      | 'ar-dz'
      | 'ast'
      | 'az'
      | 'be'
      | 'bg'
      | 'bn'
      | 'br'
      | 'bs'
      | 'ca'
      | 'ckb'
      | 'cs'
      | 'cy'
      | 'da'
      | 'de'
      | 'dsb'
      | 'el'
      | 'en'
      | 'en-au'
      | 'en-gb'
      | 'eo'
      | 'es'
      | 'es-ar'
      | 'es-co'
      | 'es-mx'
      | 'es-ni'
      | 'es-ve'
      | 'et'
      | 'eu'
      | 'fa'
      | 'fi'
      | 'fr'
      | 'fy'
      | 'ga'
      | 'gd'
      | 'gl'
      | 'he'
      | 'hi'
      | 'hr'
      | 'hsb'
      | 'hu'
      | 'hy'
      | 'ia'
      | 'id'
      | 'ig'
      | 'io'
      | 'is'
      | 'it'
      | 'ja'
      | 'ka'
      | 'kab'
      | 'kk'
      | 'km'
      | 'kn'
      | 'ko'
      | 'ky'
      | 'lb'
      | 'lt'
      | 'lv'
      | 'mk'
      | 'ml'
      | 'mn'
      | 'mr'
      | 'ms'
      | 'my'
      | 'nb'
      | 'ne'
      | 'nl'
      | 'nn'
      | 'os'
      | 'pa'
      | 'pl'
      | 'pt'
      | 'pt-br'
      | 'ro'
      | 'ru'
      | 'sk'
      | 'sl'
      | 'sq'
      | 'sr'
      | 'sr-latn'
      | 'sv'
      | 'sw'
      | 'ta'
      | 'te'
      | 'tg'
      | 'th'
      | 'tk'
      | 'tr'
      | 'tt'
      | 'udm'
      | 'ug'
      | 'uk'
      | 'ur'
      | 'uz'
      | 'vi'
      | 'zh-hans'
      | 'zh-hant'
  ): CancelablePromise<Record<string, any>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/schema/',
      query: {
        format: format,
        lang: lang
      }
    })
  }
}
