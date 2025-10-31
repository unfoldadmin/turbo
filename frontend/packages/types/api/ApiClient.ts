/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { AdminService } from './services/AdminService';
import { AircraftService } from './services/AircraftService';
import { AuthService } from './services/AuthService';
import { EquipmentService } from './services/EquipmentService';
import { FlightsService } from './services/FlightsService';
import { FuelerCertificationsService } from './services/FuelerCertificationsService';
import { FuelersService } from './services/FuelersService';
import { GatesService } from './services/GatesService';
import { LineSchedulesService } from './services/LineSchedulesService';
import { ParkingLocationsService } from './services/ParkingLocationsService';
import { TankReadingsService } from './services/TankReadingsService';
import { TanksService } from './services/TanksService';
import { TrainingsService } from './services/TrainingsService';
import { TransactionsService } from './services/TransactionsService';
import { UsersService } from './services/UsersService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ApiClient {
    public readonly admin: AdminService;
    public readonly aircraft: AircraftService;
    public readonly auth: AuthService;
    public readonly equipment: EquipmentService;
    public readonly flights: FlightsService;
    public readonly fuelerCertifications: FuelerCertificationsService;
    public readonly fuelers: FuelersService;
    public readonly gates: GatesService;
    public readonly lineSchedules: LineSchedulesService;
    public readonly parkingLocations: ParkingLocationsService;
    public readonly tankReadings: TankReadingsService;
    public readonly tanks: TanksService;
    public readonly trainings: TrainingsService;
    public readonly transactions: TransactionsService;
    public readonly users: UsersService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.admin = new AdminService(this.request);
        this.aircraft = new AircraftService(this.request);
        this.auth = new AuthService(this.request);
        this.equipment = new EquipmentService(this.request);
        this.flights = new FlightsService(this.request);
        this.fuelerCertifications = new FuelerCertificationsService(this.request);
        this.fuelers = new FuelersService(this.request);
        this.gates = new GatesService(this.request);
        this.lineSchedules = new LineSchedulesService(this.request);
        this.parkingLocations = new ParkingLocationsService(this.request);
        this.tankReadings = new TankReadingsService(this.request);
        this.tanks = new TanksService(this.request);
        this.trainings = new TrainingsService(this.request);
        this.transactions = new TransactionsService(this.request);
        this.users = new UsersService(this.request);
    }
}
