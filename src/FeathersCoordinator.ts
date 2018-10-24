import feathersAuthClient from "@feathersjs/authentication-client";
import { Conflict } from "@feathersjs/errors";
import feathers, { Application, ServiceAddons, ServiceMethods, ServiceOverloads, Paginated } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import * as Promise from 'bluebird';
import * as fetch from 'isomorphic-fetch';
import * as io from "socket.io-client";
import AbstractCoordinator from "./AbstractCoordinator";
import Credentials from "./Credentials";
import Resource from "./Resource";
import ClientNameNotUnique from "./errors/ClientNameNotUnique";
import DeviceNotFoundError from "./errors/DeviceNotFoundError";
import DeviceUuidIsNotUnique from "./errors/DeviceUuidIsNotUnique";
import ResourceNotFound from "./errors/ResourceNotFoundError";


export default class FeathersCoordinator extends AbstractCoordinator {
    private static GENERIC_EVENT_CALLBACK: (evenType: string) => (event: any) => void
        = (evenType: string) => (event: any) => console.log(evenType + ":", event);
    private static LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY: string = 'feathers-jwt';
    private resource: Resource;
    private instance: any;
    private socket: SocketIOClient.Socket;
    private feathersClient: Application<object>;
    private localDeviceUrl: string;
    private devicesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private instancesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private eventsService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private resourcesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private storage: Storage;

    constructor(brokerUrl: string,
        localDeviceUrl: string,
        credentials: Credentials = null,
        onAuthenticated: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('authenticated'),
        onLogout: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('logout'),
        onReAuthenticationError: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('reauthentication-error'),
        clientId: string = 'default',
        localStorageLocation: string = "./data/localstorage") {
        super();
        this.resource = new Resource(clientId, credentials);
        this.socket = io(brokerUrl);
        this.localDeviceUrl = localDeviceUrl;
        this.feathersClient = feathers();
        this.feathersClient.configure(socketio(this.socket));

        this.devicesService = this.feathersClient.service('devices');
        this.instancesService = this.feathersClient.service('instances');
        this.eventsService = this.feathersClient.service('events');
        this.resourcesService = this.feathersClient.service('resources');

        if ((typeof window === "undefined" || window === null) ||
            (typeof window.localStorage === "undefined" || window.localStorage === null)) {
            let NodeLocalStorage = require('node-localstorage').LocalStorage
            this.storage = new NodeLocalStorage(localStorageLocation);
        } else {
            this.storage = window.localStorage;
        }

        if (!this.resource.credentials && this.storage.getItem(FeathersCoordinator.LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY)) {
            this.resource.credentials = new Credentials('jwt', [this.storage.getItem(FeathersCoordinator.LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY)]);
        }

        this.feathersClient.configure(feathersAuthClient({ storage: this.storage }));
        this.feathersClient.on('authenticated', onAuthenticated ? onAuthenticated : FeathersCoordinator.GENERIC_EVENT_CALLBACK('authenticated'));
        this.feathersClient.on('logout', onLogout ? onLogout : FeathersCoordinator.GENERIC_EVENT_CALLBACK('logout'));
        this.feathersClient.on('reauthentication-error', onReAuthenticationError ? onReAuthenticationError : FeathersCoordinator.GENERIC_EVENT_CALLBACK('reauthentication-error'));
    }

    private get credentials(): Credentials {
        return this.resource.credentials;
    }

    private set credentials(credentials: Credentials) {
        this.resource.credentials = credentials;
    }

    private get user(): any {
        return this.resource.user;
    }

    public init(subscriberFunction: (resource: any, eventType: string) => void = null): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.feathersClient.passport.getJWT().then(jwt => {
                if (jwt) {
                    this.resource.credentials = new Credentials('jwt', [jwt]);
                }
                const auth: any = {};
                switch (this.resource.credentials.type) {
                    case 'yanux':
                        auth['strategy'] = 'yanux';
                        auth['accessToken'] = this.resource.credentials.values[0];
                        auth['clientId'] = this.resource.credentials.values[1];
                        break;
                    case 'local':
                        auth['strategy'] = 'local';
                        auth['email'] = this.resource.credentials.values[0];
                        auth['password'] = this.resource.credentials.values[1];
                        break;
                    case 'jwt':
                        auth['strategy'] = 'jwt';
                        auth['accessToken'] = this.resource.credentials.values[0];
                }
                return auth;
            }).then(auth => {
                return this.feathersClient.authenticate(auth);
            }).then(response => {
                return this.feathersClient.passport.verifyJWT(response.accessToken);
            }).then(payload => {
                const promises = [this.feathersClient.service('users').get(payload.userId)]
                if (payload.clientId) {
                    promises.push(this.feathersClient.service('clients').get(payload.clientId));
                }
                return Promise.all(promises);
            }).then(results => {
                this.resource.user = results[0];
                if (results[1]) {
                    return this.feathersClient.service('clients').get(results[1]);
                } else {
                    return this.feathersClient.service('clients').find({ query: { id: this.resource.clientId } });
                }
            }).then(results => {
                const clients = (results as any).data ? (results as any).data : results;
                if (Array.isArray(clients)) {
                    if (clients.length === 1) {
                        return clients[0];
                    } else if (clients.length === 0) {
                        return this.feathersClient.service('clients').create({ id: this.resource.clientId });
                    } else {
                        reject(new ClientNameNotUnique('The impossible has happened! There is more than a single client with the same UNIQUE name.'));
                    }
                } else {
                    return clients;
                }
            }).then(client => {
                this.resource.client = client;
                return fetch(`${this.localDeviceUrl}/deviceInfo`)
            }).then(response => {
                return response.json()
            }).then(deviceInfo => {
                return this.devicesService.find({
                    query: {
                        deviceUuid: deviceInfo.deviceUuid
                    }
                });
            }).then(results => {
                const devices = (results as any).data ? (results as any).data : results;
                if (devices.length === 1) {
                    return this.instancesService.create({
                        user: this.resource.user._id,
                        client: this.resource.client._id,
                        device: devices[0]._id
                    });
                } else if (devices.length > 1) {
                    reject(new DeviceUuidIsNotUnique('The impossible has happened! There is more than a device client with the same UUID.'));
                } else {
                    reject(new DeviceNotFoundError('A device with the given UUID could\'nt be found!'));
                }
            }).then(instance => {
                this.instance = instance;
                console.log('Instance:',instance);
                //const beaconsService = this.feathersClient.service('beacons');
                /*beaconsService.on('created', beacon => {
                    console.log('Event Beacon Created', beacon)
                });*/
                /*beaconsService.on('patched', beacon => {
                    console.log('Event Beacon Patched', beacon)
                });*/
                /*beaconsService.on('removed', beacon => {
                    console.log('Event Beacon Removed', beacon)
                });*/
                /** 
                 * TODO:
                 * Do something with the incoming proxemic events! 
                 */
                this.eventsService.on('proxemics', event => {
                    console.log('Proxemics:', event);
                });
            }).then(() => {
                if (subscriberFunction) {
                    this.subscribe(subscriberFunction);
                }
                return this.resourcesService.create({
                    user: this.resource.user._id,
                    client: this.resource.client._id
                });
            }).then(() => {
                resolve(this.getData())
            }).catch(err => {
                if (!(err instanceof Conflict)) {
                    reject(err);
                } else {
                    return resolve(this.getData());
                }
            })
        });
    }

    public logout() {
        this.feathersClient.logout();
    }

    private getResource(): Promise<Resource> {
        return new Promise((resolve, reject) => {
            this.resourcesService.find({
                query: {
                    user: this.resource.user._id,
                    client: this.resource.client._id
                }
            }).then(resources => {
                if ((<Array<any>>resources).length === 1) {
                    this.resource.update((<any>resources)[0])
                    return resolve(this.resource);
                } else {
                    reject(new ResourceNotFound('Could not find the resource associated with the current application/user pair.'))
                }
            }).catch(err => reject(err));
        });
    }

    public getData(): Promise<any> {
        return this.getResource().then(resource => resource.data).catch(err => Promise.reject(err));
    }

    public setData(data: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.resourcesService.patch(this.resource.id, { data: data })
                .then(resource => {
                    resolve(resource.data)
                }).catch(err => reject(err));
        })
    }

    public subscribe(subscriberFunction: (data: any, eventType: string) => void): void {
        let eventListener = (resource: any, eventType: string = 'updated') => {
            /**
             * TODO: This should be enforced at the Broker level.
             * I should also enforce that the Client ID of the token that is
             * used for authentication matches the provided clientId.
             * However, I have yet to find a straightforward way of doing so.
             * I will surely have to make some server-side ajustments that may
             * force me to change the way things are handled on the client-side
             * in order to provide extra security.
             */
            if (this.resource.id === resource._id
                && this.resource.client._id === resource.client
                && this.resource.user._id === resource.user) {
                this.resource.update(resource);
                subscriberFunction(this.resource.data, eventType);
            } else {
                console.error('I\'m getting events that I shouldn\'t have heard about.');
            }
        };
        this.resourcesService.on('updated', resource => eventListener(resource, 'updated'));
        this.resourcesService.on('patched', resource => eventListener(resource, 'patched'));
    }
}
