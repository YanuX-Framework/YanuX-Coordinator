import feathersAuthClient from "@feathersjs/authentication-client";
import { Conflict } from "@feathersjs/errors";
import feathers, { Application, ServiceAddons, ServiceMethods, ServiceOverloads, Paginated } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import * as fetch from 'isomorphic-fetch';
import * as io from "socket.io-client";
import AbstractCoordinator from "./AbstractCoordinator";
import Client from "./Client";
import Credentials from "./Credentials";
import Resource from "./Resource";
import Proxemics from "./Proxemics";
import Instance from "./Instance";
import ClientNameNotUnique from "./errors/ClientNameNotUnique";
import DeviceNotFoundError from "./errors/DeviceNotFoundError";
import DeviceUuidIsNotUnique from "./errors/DeviceUuidIsNotUnique";
import ResourceNotFound from "./errors/ResourceNotFoundError";
import ProxemicsNotFoundError from "./errors/ProxemicsNotFoundError";

export default class FeathersCoordinator extends AbstractCoordinator {
    private static GENERIC_EVENT_CALLBACK: (evenType: string) => (event: any) => void
        = (evenType: string) => (event: any) => console.log(evenType + ":", event);
    private static LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY: string = 'feathers-jwt';

    public user: any;
    public client: Client;
    public device: any;
    public resource: Resource;
    public proxemics: Proxemics;
    public instance: Instance;
    public instances: Array<any>;
    public activeInstances: Array<any>;


    private localDeviceUrl: string;
    private credentials: Credentials;
    private socket: SocketIOClient.Socket;
    private feathersClient: Application<object>;

    private devicesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private instancesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private resourcesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private proxemicsService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private storage: Storage;

    constructor(brokerUrl: string,
        localDeviceUrl: string,
        clientId: string = 'default',
        credentials: Credentials = null,
        onAuthenticated: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('authenticated'),
        onLogout: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('logout'),
        onReAuthenticationError: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('reauthentication-error'),
        localStorageLocation: string = "./data/localstorage") {
        super();

        this.client = new Client(clientId);
        this.credentials = credentials;
        this.resource = new Resource();
        this.proxemics = new Proxemics();
        this.instance = new Instance();
        this.instances = new Array<any>();
        this.activeInstances = new Array<any>();

        this.socket = io(brokerUrl);
        this.localDeviceUrl = localDeviceUrl;
        this.feathersClient = feathers();
        this.feathersClient.configure(socketio(this.socket));

        this.devicesService = this.feathersClient.service('devices');
        this.instancesService = this.feathersClient.service('instances');
        this.resourcesService = this.feathersClient.service('resources');
        this.proxemicsService = this.feathersClient.service('proxemics');

        if ((typeof window === "undefined" || window === null) ||
            (typeof window.localStorage === "undefined" || window.localStorage === null)) {
            let NodeLocalStorage = require('node-localstorage').LocalStorage
            this.storage = new NodeLocalStorage(localStorageLocation);
        } else {
            this.storage = window.localStorage;
        }

        if (!this.credentials && this.storage.getItem(FeathersCoordinator.LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY)) {
            this.credentials = new Credentials('jwt', [this.storage.getItem(FeathersCoordinator.LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY)]);
        }

        this.feathersClient.configure(feathersAuthClient({ storage: this.storage }));
        this.feathersClient.on('authenticated', onAuthenticated ? onAuthenticated : FeathersCoordinator.GENERIC_EVENT_CALLBACK('authenticated'));
        this.feathersClient.on('logout', onLogout ? onLogout : FeathersCoordinator.GENERIC_EVENT_CALLBACK('logout'));
        this.feathersClient.on('reauthentication-error', onReAuthenticationError ? onReAuthenticationError : FeathersCoordinator.GENERIC_EVENT_CALLBACK('reauthentication-error'));

        //Re-initialize on reconnect
        const feathersSocketClient: SocketIOClient.Socket = this.feathersClient as any;
        feathersSocketClient.io.on('reconnect', (attempt: any) => {
            this.init().then(resource => {
                console.log(`Reconnected after ${attempt} attempts`);
            }).catch(e => console.error(e));
        });

        document.addEventListener("visibilitychange", () => this.setInstanceActiveness(!document.hidden));
    }

    public init(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.feathersClient.passport.getJWT().then(jwt => {
                if (jwt) {
                    this.credentials = new Credentials('jwt', [jwt]);
                }
                const auth: any = {};
                switch (this.credentials.type) {
                    case 'yanux':
                        auth['strategy'] = 'yanux';
                        auth['accessToken'] = this.credentials.values[0];
                        auth['clientId'] = this.credentials.values[1];
                        break;
                    case 'local':
                        auth['strategy'] = 'local';
                        auth['email'] = this.credentials.values[0];
                        auth['password'] = this.credentials.values[1];
                        break;
                    case 'jwt':
                        auth['strategy'] = 'jwt';
                        auth['accessToken'] = this.credentials.values[0];
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
                this.user = results[0];
                if (results[1]) {
                    return this.feathersClient.service('clients').get(results[1]);
                } else {
                    return this.feathersClient.service('clients').find({ query: { id: this.client.id } });
                }
            }).then(results => {
                const clients = (results as any).data ? (results as any).data : results;
                if (Array.isArray(clients)) {
                    if (clients.length === 1) {
                        return clients[0];
                    } else if (clients.length === 0) {
                        return this.feathersClient.service('clients').create({ id: this.client.id });
                    } else {
                        reject(new ClientNameNotUnique('The impossible has happened! There is more than a single client with the same UNIQUE name.'));
                    }
                } else {
                    return clients;
                }
            }).then(client => {
                this.client.raw = client;
                return fetch(`${this.localDeviceUrl}/deviceInfo`);
            }).then(response => {
                return response.json();
            }).then(deviceInfo => {
                return this.devicesService.find({
                    query: {
                        $limit: 1,
                        user: this.user._id,
                        deviceUuid: deviceInfo.deviceUuid
                    }
                });
            }).then(results => {
                const devices = (results as any).data ? (results as any).data : results;
                if (devices.length === 1) {
                    this.device = devices[0];
                    return this.instancesService.create({
                        user: this.user._id,
                        client: this.client.raw._id,
                        device: devices[0]._id
                    });
                } else if (devices.length > 1) {
                    reject(new DeviceUuidIsNotUnique('The impossible has happened! There is more than a device client with the same UUID.'));
                } else {
                    reject(new DeviceNotFoundError('A device with the given UUID could\'nt be found!'));
                }
            }).then(instance => {
                this.instance.update(instance);
                console.log('Instance:', instance);
                return this.resourcesService.create({
                    user: this.user._id,
                    client: this.client.raw._id
                }).then(resource => resource).catch(err => {
                    if (!(err instanceof Conflict)) {
                        reject(err);
                    }
                });
            }).then(() => {
                return this.proxemicsService.create({
                    user: this.user._id,
                }).then(proxemics => proxemics).catch(err => {
                    if (!(err instanceof Conflict)) {
                        reject(err);
                    }
                });
            }).then(() => this.updateInstanceActiveness()).then(() => {
                return Promise.all([this.getResourceData(), this.getProxemicsState()]);
            }).then(results => resolve(results)).catch(err => reject(err))
        });
    }

    public logout() {
        this.feathersClient.logout();
    }

    private getResource(): Promise<Resource> {
        return new Promise((resolve, reject) => {
            this.resourcesService.find({
                query: {
                    $limit: 1,
                    user: this.user._id,
                    client: this.client.raw._id
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

    public getResourceData(): Promise<any> {
        return this.getResource().then(resource => resource.data).catch(err => Promise.reject(err));
    }

    public setResourceData(data: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.resourcesService.patch(this.resource.id, { data: data })
                .then(resource => {
                    this.resource.update(resource);
                    resolve(resource.data)
                }).catch(err => reject(err));
        });
    }

    private getProxemics(): Promise<Proxemics> {
        return new Promise((resolve, reject) => {
            this.proxemicsService.find({
                query: {
                    $limit: 1,
                    user: this.user._id
                }
            }).then(proxemics => {
                if ((<Array<any>>proxemics).length === 1) {
                    this.proxemics.update((<any>proxemics)[0])
                    return resolve(this.proxemics);
                } else {
                    reject(new ProxemicsNotFoundError('Could not find proxemics associated with the current user.'))
                }
            }).catch(err => reject(err));
        });
    }

    public getProxemicsState(): Promise<any> {
        return this.getProxemics().then(proxemics => proxemics.state).catch(err => Promise.reject(err));
    }

    public nothing(): any {
        console.log('nothing pppo');
    }

    public getInstances(extraConditions: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const query: any = {
                $populate: 'device',
                user: this.user._id,
                client: this.client.raw._id
            };
            Object.assign(query, extraConditions);
            this.instancesService.find({
                query
            }).then(instances => {
                if (!extraConditions) {
                    this.instances = instances;
                }
                return resolve(instances);
            }).catch(err => reject(err));
        });
    }

    public getActiveInstances(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getInstances({
                active: true
            }).then(activeInstances => {
                this.activeInstances = activeInstances;
                return resolve(this.activeInstances)
            }).catch(err => reject(err));
        });
    }

    public updateInstanceActiveness(): Promise<any> {
        return this.setInstanceActiveness(!document.hidden);
    }

    public setInstanceActiveness(active: Boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.instancesService.patch(this.instance.id, { active: active })
                .then(instance => {
                    this.instance.update(instance);
                    resolve(instance)
                }).catch(err => reject(err));
        });
    }

    public subscribeResource(subscriberFunction: (data: any, eventType: string) => void): void {
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
            if (this.resource.id === resource._id &&
                this.client.raw._id === resource.client &&
                this.user._id === resource.user) {
                this.resource.update(resource);
                subscriberFunction(this.resource.data, eventType);
            } else {
                console.error('I\'m getting events that I shouldn\'t have heard about.');
            }
        };
        this.resourcesService.on('updated', resource => eventListener(resource, 'updated'));
        this.resourcesService.on('patched', resource => eventListener(resource, 'patched'));
    }

    public subscribeProxemics(subscriberFunction: (data: any, eventType: string) => void): void {
        let eventListener = (proxemics: any, eventType: string = 'updated') => {
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the "subscribeResource" method for an explanation.]
             */
            if (this.proxemics.id === proxemics._id &&
                this.user._id === proxemics.user) {
                this.proxemics.update(proxemics);
                subscriberFunction(proxemics.state, eventType);
            } else {
                console.error('I\'m getting events that I shouldn\'t have heard about.');
            }
        };
        this.proxemicsService.on('updated', proxemics => eventListener(proxemics, 'updated'));
        this.proxemicsService.on('patched', proxemics => eventListener(proxemics, 'patched'));
    }

    public subscribeInstances(subscriberFunction: (data: any, eventType: string) => void): void {
        let eventListener = (instance: any, eventType: string = 'updated') => {
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the "subscribeResource" method for an explanation.]
             */
            if (this.user._id === instance.user && this.client.raw._id === instance.client) {
                if (this.instance.id === instance._id) {
                    this.instance.update(instance);
                }
                subscriberFunction(instance, eventType);
            } else {
                console.error('I\'m getting events that I shouldn\'t have heard about.');
            }
        };
        this.instancesService.on('updated', instance => eventListener(instance, 'updated'));
        this.instancesService.on('patched', instance => eventListener(instance, 'patched'));
    }
}
