/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for parking locations (hangars, terminal, ramps, tie-downs)
 */
export type ParkingLocation = {
    readonly id: number;
    /**
     * Unique code: CAPS, alphanumeric, hyphens only. Examples: T-A1, D-1, BRETZ
     */
    location_code: string;
    description?: string;
    /**
     * Latitude coordinate for map display
     */
    latitude?: string | null;
    /**
     * Longitude coordinate for map display
     */
    longitude?: string | null;
    /**
     * Array of [lat, lon] coordinates defining hangar boundaries
     */
    polygon?: any;
    /**
     * Airport code: MSO, USFS, etc.
     */
    airport?: string;
    /**
     * Terminal identifier: T, MIN, MAINT, etc.
     */
    terminal?: string | null;
    /**
     * Gate number: A1, A2, B1, B2, etc.
     */
    gate?: string | null;
    /**
     * 0 = inactive/hidden, higher numbers = more popular (shows first in lists)
     */
    display_order?: number;
    readonly is_active: string;
    readonly created_at: string;
    readonly modified_at: string;
};
