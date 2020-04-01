import _ from 'lodash';
import feathersAuthClient from '@feathersjs/authentication-client';
import { StorageWrapper } from '@feathersjs/authentication-client/lib/storage';
import jsrsasign from 'jsrsasign';

import { Conflict } from '@feathersjs/errors';
import feathers, { Application, ServiceAddons, ServiceMethods, ServiceOverloads } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import fetch from 'cross-fetch';
import io from 'socket.io-client';
import AbstractCoordinator from './AbstractCoordinator';
import Client from './Client';
import Credentials from './Credentials';
import DefaultResource from './Resource';
import Proxemics from './Proxemics';
import Instance from './Instance';
import SharedResource from './SharedResource';

import ClientNameNotUnique from './errors/ClientNameNotUnique';
import DeviceNotFoundError from './errors/DeviceNotFoundError';
import DeviceUuidNotUnique from './errors/DeviceUuidNotUnique';
import InvalidBrokerJwtError from './errors/InvalidBrokerJwtError';
import UnavailableResourceId from './errors/UnavailableResourceId';
import UnavailableInstanceId from './errors/UnavailableInstanceId';
import ResourceNotFound from './errors/ResourceNotFound';
import UnsupportedConfiguration from './errors/UnsupportedConfiguration'
import UserNotFoundError from './errors/UserNotFoundError';


export default class FeathersCoordinator extends AbstractCoordinator {
    private static GENERIC_EVENT_CALLBACK: (evenType: string) => (event: any) => void
        = (evenType: string) => (event: any) => console.log('[YXC] ' + evenType + ':', event);
    private static LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY: string = 'feathers-jwt';
    private static CACHED_INSTANCES_MAX_AGE: Number = 10000;

    public user: any;
    public client: Client;
    public device: any;
    public resource: DefaultResource;
    public proxemics: Proxemics;
    public instance: Instance;
    public cachedInstances: Map<string, Instance>;

    private localDeviceUrl: string;
    private credentials: Credentials;
    private socket: SocketIOClient.Socket;
    private feathersClient: Application<object>;

    private usersService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private devicesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private instancesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private resourcesService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private proxemicsService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private eventsService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;

    private brokerPublicKey: string;
    private storage: Storage;

    private subscribeResourcesFunction: (data: any, eventType: string) => void
    private subscribeResourceFunction: (data: any, eventType: string) => void;
    private subscribeProxemicsFunction: (data: any, eventType: string) => void;
    private subscribeInstancesFunction: (data: any, eventType: string) => void;
    private subscribeEventsFunction: (data: any, eventType: string) => void;
    private subscribeReconnectsFunction: (state: any, proxemics: any) => void;

    constructor(brokerUrl: string,
        localDeviceUrl: string,
        clientId: string = 'default',
        credentials: Credentials = null,
        brokerPublicKey: string = null,
        onAuthenticated: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('authenticated'),
        onLogout: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('logout'),
        onReAuthenticationError: (event: any) => void = FeathersCoordinator.GENERIC_EVENT_CALLBACK('reauthentication-error'),
        localStorageLocation: string = './data/localstorage') {
        super();

        this.client = new Client(clientId);
        this.credentials = credentials;
        this.resource = new DefaultResource();
        this.proxemics = new Proxemics();
        this.instance = new Instance();
        this.cachedInstances = new Map<string, Instance>();

        this.socket = io(brokerUrl, { transports: ['websocket'], forceNew: true });
        this.localDeviceUrl = localDeviceUrl;
        this.feathersClient = feathers();
        this.feathersClient.configure(socketio(this.socket, { timeout: 5000 }));

        this.usersService = this.feathersClient.service('users');
        this.devicesService = this.feathersClient.service('devices');
        this.instancesService = this.feathersClient.service('instances');
        this.resourcesService = this.feathersClient.service('resources');
        this.proxemicsService = this.feathersClient.service('proxemics');
        this.eventsService = this.feathersClient.service('events');

        this.brokerPublicKey = brokerPublicKey;

        if ((typeof window === 'undefined' || window === null) ||
            (typeof window.localStorage === 'undefined' || window.localStorage === null)) {
            let NodeLocalStorage = require('node-localstorage').LocalStorage
            this.storage = new NodeLocalStorage(localStorageLocation);
        } else { this.storage = window.localStorage; }


        this.subscribeResourceFunction = null;
        this.subscribeProxemicsFunction = null;
        this.subscribeInstancesFunction = null;
        this.subscribeReconnectsFunction = null;

        if (!this.credentials && this.storage.getItem(FeathersCoordinator.LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY)) {
            this.credentials = new Credentials('jwt', [this.storage.getItem(FeathersCoordinator.LOCAL_STORAGE_JWT_ACCESS_TOKEN_KEY)]);
        }

        this.feathersClient.configure(feathersAuthClient({ storage: new StorageWrapper(this.storage) }));
        this.feathersClient.on('authenticated', onAuthenticated ? onAuthenticated : FeathersCoordinator.GENERIC_EVENT_CALLBACK('authenticated'));
        this.feathersClient.on('logout', onLogout ? onLogout : FeathersCoordinator.GENERIC_EVENT_CALLBACK('logout'));
        this.feathersClient.on('reauthentication-error', onReAuthenticationError ? onReAuthenticationError : FeathersCoordinator.GENERIC_EVENT_CALLBACK('reauthentication-error'));

        //Re-initialize on reconnect
        const feathersSocketClient: SocketIOClient.Socket = this.feathersClient as any;
        feathersSocketClient.io.on('reconnect', (attempt: number) => {
            this.init().then((resource: any) => {
                console.log(`[YXC] Reconnected after ${attempt} attempts`);
                if (this.subscribeReconnectsFunction) {
                    this.subscribeReconnectsFunction(resource[0], resource[1]);
                }
            }).catch((err: any) => console.error('[YXC] Reconnection Error:', err));
        });
        /* TODO:
         * Perhaps I should deal with ALL/MOST of the Socket.io events!
         * https://socket.io/docs/client-api/#Event-%E2%80%98connect-error%E2%80%99
         */
        feathersSocketClient.io.on('connect_error', (error: any) => { console.error('[YXC] Connection Error:', error); })
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => this.setInstanceActiveness(!document.hidden));
        }
    }

    public init(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.feathersClient.authentication.getAccessToken().then((jwt: any) => {
                if (jwt) {
                    const jwtHeader: any = jsrsasign.KJUR.jws.JWS.readSafeJSONString(jsrsasign.b64utoutf8(jwt.split('.')[0]));
                    if (jwtHeader) { this.credentials = new Credentials('jwt', [jwt]); }
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
                        break;
                }
                return auth;
            }).then((auth: any) => {
                return this.feathersClient.authenticate(auth);
            }).then((response: any) => {
                if (this.brokerPublicKey) {
                    const header: any = jsrsasign.KJUR.jws.JWS.readSafeJSONString(jsrsasign.b64utoutf8(response.accessToken.split('.')[0]));
                    const isJwtValid = jsrsasign.KJUR.jws.JWS.verifyJWT(response.accessToken, this.brokerPublicKey, { alg: [header.alg] } as { alg: string[]; aud: string[]; iss: string[]; sub: string[] });
                    if (!isJwtValid) { throw new InvalidBrokerJwtError('The JWT is not valid.'); }
                }
                return Promise.all([
                    this.feathersClient.service('users').get(response.user ? response.user._id : response.authentication.payload.user._id),
                    this.feathersClient.service('clients').get(response.client ? response.client._id : response.authentication.payload.client._id)
                ]);
            }).then((results: any) => {
                this.user = results[0];
                if (results[1]) {
                    return this.feathersClient.service('clients').get(results[1]);
                } else {
                    return this.feathersClient.service('clients').find({ query: { id: this.client.id } });
                }
            }).then((results: any) => {
                const clients = (results as any).data ? (results as any).data : results;
                if (Array.isArray(clients)) {
                    if (clients.length === 1) {
                        return clients[0];
                    } else if (clients.length === 0) {
                        return this.feathersClient.service('clients').create({ id: this.client.id });
                    } else {
                        throw new ClientNameNotUnique('The impossible has happened! There is more than a single client with the same UNIQUE name.');
                    }
                } else { return clients; }
            }).then((client: any) => {
                this.client.raw = client;
                return fetch(`${this.localDeviceUrl}/deviceInfo`);
            }).then((response: any) => {
                return response.json();
            }).then((deviceInfo: any) => {
                return this.devicesService.find({
                    query: {
                        $limit: 1,
                        user: this.user._id,
                        deviceUuid: deviceInfo.deviceUuid
                    }
                });
            }).then((results: any) => {
                const devices = (results as any).data ? (results as any).data : results;
                if (devices.length === 1) {
                    this.device = devices[0];
                    return this.instancesService.create({
                        user: this.user._id,
                        client: this.client.raw._id,
                        device: devices[0]._id
                    });
                } else if (devices.length > 1) {
                    throw new DeviceUuidNotUnique('The impossible has happened! There is more than a device client with the same UUID.');
                } else {
                    throw new DeviceNotFoundError('A device with the given UUID couldn\'t be found!');
                }
            }).then((instance: any) => {
                this.instance.update(instance);
                console.log('[YXC] Initialized Instance:', instance);
                return this.updateInstanceActiveness()
            }).then((updatedInstance: any) => {
                console.log('[YXC] Updated Instance Activeness:', updatedInstance);
                return Promise.all([this.getResourceData(), this.getProxemicsState()]);
            }).then((results: any) => resolve(results)).catch((err: any) => {
                if (!(err instanceof Conflict)) { reject(err); }
            })
        });
    }

    public logout() { this.feathersClient.logout(); }

    public isConnected(): boolean { return this.socket.connected; }

    //TODO:
    //I encapsulated the response into something that has a specific type.
    //However, I should probably look for other places where I used "any" but that can have a specific type.
    public getResources(owned: boolean = true, sharedWith: boolean = true): Promise<Array<SharedResource>> {
        return new Promise((resolve, reject) => {
            const orCondition = [];
            if (owned) { orCondition.push({ user: this.user._id }) }
            if (sharedWith) { orCondition.push({ sharedWith: this.user._id }) }
            if (orCondition.length === 0) {
                throw new UnsupportedConfiguration('Must choose "owned", "sharedWith" or both');
            }
            this.resourcesService.find({
                query: { $populate: 'user', client: this.client.raw._id, $or: orCondition }
            }).then((resources: any) => {
                resolve(resources.map((r: any) => new SharedResource(r)));
            }).catch((err: any) => reject(err));
        });
    }

    public createResource(resourceName: string = ''): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            this.resourcesService.create({
                user: this.user._id,
                client: this.client.raw._id,
                name: resourceName,
                default: false
            }).then((resource: any) => {
                resolve(new SharedResource(resource))
            }).catch((e: Error) => { reject(e) })
        });
    }

    //TODO: Ensure that only the owner can delete the resource
    public deleteResource(id: string): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            this.resourcesService.remove(id)
                .then((resource: any) => {
                    resolve(new SharedResource(resource))
                }).catch((e: Error) => { reject(e) })
        });
    }

    public shareResource(resourceId: string, userEmail: string): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.resourcesService.get(resourceId),
                this.usersService.find({ $limit: 1, query: { email: userEmail } })
            ]).then(results => {
                let [resource, users] = results;
                if (users.length !== 1) {
                    throw new UserNotFoundError('Could not find a user with the given e-mail address.')
                } else {
                    return this.resourcesService.patch(resource._id, { $addToSet: { sharedWith: users[0]._id } });
                }
            }).then(resource => { resolve(new SharedResource(resource)); }).catch(err => { reject(err); })
        });
    }

    public unshareResource(resourceId: string, userEmail: string): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.resourcesService.get(resourceId),
                this.usersService.find({ $limit: 1, query: { email: userEmail } })
            ]).then(results => {
                let [resource, users] = results;
                if (users.length !== 1) {
                    throw new UserNotFoundError('Could not find a user with the given e-mail address.')
                } else {
                    return this.resourcesService.patch(resource._id, { $pull: { sharedWith: users[0]._id } });
                }
            }).then(resource => { resolve(new SharedResource(resource)); }).catch(err => { reject(err); })
        });
    }

    public getResourceData(id: string = null): Promise<any> {
        return this.getResource(id).then(resource => resource.data).catch(err => Promise.reject(err));
    }

    public setResourceData(data: any, id: string = null): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let resourceId: string;
            if (id) { resourceId = id; }
            else if (this.resource && this.resource.id) {
                resourceId = this.resource.id;
            }
            if (resourceId) {
                this.resourcesService
                    .patch(resourceId, { data: data })
                    .then((resource: any) => {
                        if (this.resource && this.resource.id === resourceId) {
                            this.resource.update(resource)
                        }
                        resolve(resource.data)
                    }).catch((err: any) => reject(err));
            } else { reject(new UnavailableResourceId('Unavailable Resource Id')) }
        });
    }

    private getProxemics(): Promise<Proxemics> {
        return new Promise((resolve, reject) => {
            this.proxemicsService.find({
                query: {
                    $limit: 1,
                    user: this.user._id
                }
            }).then((proxemics: any) => {
                if ((<Array<any>>proxemics).length === 1) {
                    this.proxemics.update((<any>proxemics)[0])
                    return resolve(this.proxemics);
                } else {
                    this.proxemicsService.create({
                        user: this.user._id,
                    }).then((proxemics: any) => {
                        this.proxemics.update(proxemics)
                        return resolve(this.proxemics);
                    }).catch((err: any) => {
                        if (!(err instanceof Conflict)) { reject(err); }
                    })
                }
            }).catch((err: any) => reject(err));
        });
    }

    private getResource(id: string = null): Promise<DefaultResource> {
        return new Promise((resolve, reject) => {
            let query: any;
            if (id) {
                query = { _id: id };
            } else {
                query = { $limit: 1, user: this.user._id, client: this.client.raw._id, default: true };
            }
            this.resourcesService.find({ query }).then((resources: any) => {
                if ((<Array<any>>resources).length === 1) {
                    this.resource.update((<any>resources)[0])
                    return resolve(this.resource);
                } else if (!id) {
                    this.resourcesService.create({
                        user: this.user._id,
                        client: this.client.raw._id,
                        default: true
                    }).then((resource: any) => {
                        this.resource.update(resource);
                        return resolve(this.resource);
                    }).catch((err: any) => {
                        if (!(err instanceof Conflict)) {
                            reject(err);
                        } else { resolve(this.resource); }
                    });
                } else { reject(new ResourceNotFound('Resource Not Found')); }
            }).catch((err: any) => reject(err));
        });
    }

    public getProxemicsState(): Promise<any> {
        return this.getProxemics().then(proxemics => proxemics.state).catch(err => Promise.reject(err));
    }

    public getInstances(extraConditions: any): Promise<any> {
        const query: any = {
            $populate: 'device',
            user: this.user._id,
            client: this.client.raw._id
        };
        Object.assign(query, extraConditions);
        return this.instancesService.find({ query })
    }

    public getActiveInstances(): Promise<any> {
        return this.getInstances({ active: true });
    }

    public updateInstanceActiveness(): Promise<any> {
        if (typeof document !== 'undefined') {
            return this.setInstanceActiveness(!document.hidden);
        } else { return Promise.resolve(); }
    }

    public setInstanceActiveness(active: Boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.instance && this.instance.id) {
                this.instancesService
                    .patch(this.instance.id, { active: active })
                    .then((instance: any) => {
                        this.instance.update(instance);
                        resolve(instance)
                    }).catch((err: any) => reject(err));
            } else { reject(new UnavailableInstanceId('Unavailable Instance Id')) }
        });
    }

    public setComponentDistribution(components: any, auto: Boolean = true, instanceId: string = this.instance.id): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (instanceId) {
                this.instancesService
                    .patch(instanceId, { componentsDistribution: { auto, components } })
                    .then((instance: any) => {
                        if (this.instance.id === instanceId) {
                            this.instance.update(instance);
                        }
                        resolve(instance)
                    }).catch((err: any) => reject(err));
            } else { reject(new UnavailableInstanceId('Unavailable Instance Id')) }

        });
    }

    public emitEvent(value: any, name: string): Promise<any> {
        return this.eventsService.create({ value, name });
    }

    public subscribeResources(subscriberFunction: (data: any, eventType: string) => void): void {
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
            if (this.client && this.client.raw._id === resource.client &&
                this.user && (this.user._id === resource.user || resource.sharedWith.some((u: any) => u === this.user._id))) {
                subscriberFunction(new SharedResource(resource), eventType);
            } else { console.error('[YXC] subscribeResources - Ignored Event Type:', eventType, 'on Resource:', resource); }
        };
        this.unsubscribeResources();
        //TODO: Make sure that what I really need are the "created", "updated", "patched" and "removed" events.
        this.resourcesService.on('created', (resource: any) => eventListener(resource, 'created'));
        this.resourcesService.on('updated', (resource: any) => eventListener(resource, 'updated'));
        this.resourcesService.on('patched', (resource: any) => eventListener(resource, 'patched'));
        this.resourcesService.on('removed', (resource: any) => eventListener(resource, 'removed'));
        this.subscribeResourcesFunction = eventListener;
    }

    public unsubscribeResources(): void {
        this.resourcesService.removeListener('created', this.subscribeResourcesFunction);
        this.resourcesService.removeListener('updated', this.subscribeResourcesFunction);
        this.resourcesService.removeListener('patched', this.subscribeResourcesFunction);
        this.resourcesService.removeListener('removed', this.subscribeResourcesFunction);
        this.subscribeResourcesFunction = null;
    }

    public subscribeResource(subscriberFunction: (data: any, eventType: string) => void, id: string = null): void {
        let eventListener = (resource: any, eventType: string = 'updated') => {
            let subscribedResourceId: string;
            if (id) { subscribedResourceId = id; }
            else if (this.resource && this.resource.id) {
                subscribedResourceId = this.resource.id;
            }
            /**
             * TODO: This should be enforced at the Broker level.
             * I should also enforce that the Client ID of the token that is
             * used for authentication matches the provided clientId.
             * However, I have yet to find a straightforward way of doing so.
             * I will surely have to make some server-side ajustments that may
             * force me to change the way things are handled on the client-side
             * in order to provide extra security.
             */
            if (subscribedResourceId === resource._id &&
                this.client && this.client.raw._id === resource.client &&
                this.user && (this.user._id === resource.user || resource.sharedWith.some((u: any) => u === this.user._id))) {
                if (this.resource && this.resource.id === resource._id) {
                    this.resource.update(resource);
                }
                subscriberFunction(new SharedResource(resource).data, eventType);
            } else { console.error('[YXC] subscribeResource - Ignored Event Type:', eventType, 'on Resource:', resource); }
        };
        this.unsubscribeResource();
        //TODO: Make sure that I only need "updated" and "patched" events.
        this.resourcesService.on('updated', (resource: any) => eventListener(resource, 'updated'));
        this.resourcesService.on('patched', (resource: any) => eventListener(resource, 'patched'));
        this.subscribeResourceFunction = eventListener;
    }

    public unsubscribeResource(): void {
        this.resourcesService.removeListener('updated', this.subscribeResourceFunction);
        this.resourcesService.removeListener('patched', this.subscribeResourceFunction);
        this.subscribeResourceFunction = null;
    }

    public subscribeProxemics(subscriberFunction: (data: any, eventType: string) => void): void {
        let eventListener = (proxemics: any, eventType: string = 'updated') => {
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the 'subscribeResource' method for an explanation.]
             */
            if (this.proxemics && this.proxemics.id === proxemics._id &&
                this.user && this.user._id === proxemics.user) {
                if (!_.isEqual(proxemics.state, this.proxemics.state)) {
                    this.proxemics.update(proxemics);
                    subscriberFunction(this.proxemics.state, eventType);
                }
            } else { console.error('[YXC] subscribeProxemics - Ignored Event Type:', eventType, 'on Proxemics:', proxemics); }
        };
        this.unsubscribeProxemics();
        //TODO: Make sure that I only need "updated" and "patched" events.
        this.proxemicsService.on('updated', (proxemics: any) => eventListener(proxemics, 'updated'));
        this.proxemicsService.on('patched', (proxemics: any) => eventListener(proxemics, 'patched'));
        this.subscribeProxemicsFunction = eventListener;
    }

    public unsubscribeProxemics(): void {
        this.proxemicsService.removeListener('updated', this.subscribeProxemicsFunction);
        this.proxemicsService.removeListener('patched', this.subscribeProxemicsFunction);
        this.subscribeProxemicsFunction = null;
    }

    public subscribeInstances(subscriberFunction: (data: any, eventType: string) => void): void {
        let eventListener = (instance: any, eventType: string = 'updated') => {
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the 'subscribeResource' method for an explanation.]
             */
            const newInstance = new Instance(instance);
            if (this.user && this.user._id === instance.user &&
                this.client && this.client.raw && this.client.raw._id === instance.client) {
                if (this.instance.id === newInstance.id) {
                    this.instance = newInstance;
                }
                if (!newInstance.equals(this.cachedInstances.get(newInstance.id))) {
                    subscriberFunction(instance, eventType);
                }
                this.cachedInstances.set(newInstance.id, newInstance);
                this.cleanUpCachedInstances();
            } else { console.error('[YXC] subscribeInstances - Ignored Event Type:', eventType, 'on Instance:', instance); }
        };
        this.unsubscribeInstances();
        //TODO: Make sure that I only need "updated" and "patched" events.
        this.instancesService.on('updated', (instance: any) => eventListener(instance, 'updated'));
        this.instancesService.on('patched', (instance: any) => eventListener(instance, 'patched'));
        this.subscribeInstancesFunction = eventListener;
    }

    public unsubscribeInstances(): void {
        this.instancesService.removeListener('updated', this.subscribeInstancesFunction);
        this.instancesService.removeListener('patched', this.subscribeInstancesFunction);
        this.subscribeInstancesFunction = null;
    }

    private cleanUpCachedInstances(): void {
        this.cachedInstances.forEach((instance: Instance) => {
            if (new Date().getTime() - instance.timestamp.getTime() > FeathersCoordinator.CACHED_INSTANCES_MAX_AGE) {
                this.cachedInstances.delete(instance.id);
            }
        });
    }

    public subscribeEvents(subscriberFunction: (data: any, eventType: string) => void): void {
        let eventListener = (event: any, eventType: string = 'created') => {
            subscriberFunction(event, eventType);
        };
        this.unsubscribeEvents();
        this.eventsService.on('created', (event: any) => eventListener(event, 'created'));
        this.subscribeEventsFunction = eventListener;
    }

    public unsubscribeEvents(): void {
        this.eventsService.removeListener('created', this.subscribeEventsFunction);
        this.subscribeEventsFunction = null;
    }

    public subscribeReconnects(subscriberFunction: (state: any, proxemics: any) => void): void {
        this.subscribeReconnectsFunction = subscriberFunction;
    }

    public unsubscribeReconnects(): void {
        this.subscribeReconnectsFunction = null;
    }
}
