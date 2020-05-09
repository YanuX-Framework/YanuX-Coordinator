import { isEqual } from 'lodash';
import feathersAuthClient from '@feathersjs/authentication-client';
import { StorageWrapper } from '@feathersjs/authentication-client/lib/storage';
import jsrsasign from 'jsrsasign';

import { Conflict } from '@feathersjs/errors';
import feathers, { Application, ServiceAddons, ServiceMethods, ServiceOverloads } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import fetch from 'cross-fetch';
import io from 'socket.io-client';
import AbstractCoordinator from './AbstractCoordinator';
import BaseEntity from './BaseEntity';
import User from './User';
import Client from './Client';
import Credentials from './Credentials';
import BaseResource from './BaseResource';
import Proxemics from './Proxemics';
import Instance from './Instance';
import SharedResource from './SharedResource';

import DeviceNotFoundError from './errors/DeviceNotFoundError';
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

    public user: BaseEntity;
    public client: Client;
    public device: BaseEntity;
    public resource: BaseResource;
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
    private resourceSubscriptionService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private proxemicsService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private eventsService: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;

    private brokerPublicKey: string;
    private storage: Storage;

    private subscribeResourcesFunctions: { [eventType: string]: (resource: any) => void };
    private subscribeResourceSubscriptionFunctions: { [eventType: string]: (resource: any) => void };
    private subscribeResourceFunctions: { [eventType: string]: (resource: any) => void };
    private subscribeProxemicsFunctions: { [eventType: string]: (resource: any) => void };
    private subscribeInstancesFunctions: { [eventType: string]: (resource: any) => void };
    private subscribeEventsFunction: (data: any, eventType: string) => void;
    private subscribeReconnectsFunction: (resourceState: any, proxemics: any, resourceId: any) => void;

    private _subscribedResourceId: string;
    public get subscribedResourceId(): string { return this._subscribedResourceId; }

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

        this.user = new User();
        this.client = new Client(clientId);
        //TODO: Perhaps I should create a dedicated "Device" class and expand each of the other service entity classes to encompass all that returned from the server.
        this.device = new BaseEntity();
        this.credentials = credentials;
        this.resource = new BaseResource();
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
        this.resourceSubscriptionService = this.feathersClient.service('resource-subscriptions');
        this.proxemicsService = this.feathersClient.service('proxemics');
        this.eventsService = this.feathersClient.service('events');

        this.brokerPublicKey = brokerPublicKey;

        if ((typeof window === 'undefined' || window === null) ||
            (typeof window.localStorage === 'undefined' || window.localStorage === null)) {
            let NodeLocalStorage = require('node-localstorage').LocalStorage
            this.storage = new NodeLocalStorage(localStorageLocation);
        } else { this.storage = window.localStorage; }


        this.subscribeResourcesFunctions = {};
        this.subscribeResourceSubscriptionFunctions = {};
        this.subscribeResourceFunctions = {};
        this.subscribeProxemicsFunctions = {};
        this.subscribeInstancesFunctions = {};
        this.subscribeEventsFunction = null;
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
                    this.subscribeReconnectsFunction(resource[0], resource[1], resource[2]);
                }
            }).catch((e: Error) => console.error('[YXC] Reconnection Error:', e));
        });
        /* TODO:
         * Perhaps I should deal with ALL/MOST of the Socket.io events!
         * https://socket.io/docs/client-api/#Event-%E2%80%98connect-error%E2%80%99
         */
        feathersSocketClient.io.on('connect_error', (error: any) => { console.error('[YXC] Connection Error:', error); })
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => { this.setInstanceActiveness(!document.hidden); });
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
                this.user.update(results[0]);
                if (results[1]) {
                    return this.feathersClient.service('clients').get(results[1]);
                } else {
                    return this.feathersClient.service('clients').find({ query: { $limit: 1, id: this.client.clientId } });
                }
            }).then((results: any) => {
                const clients = (results as any).data ? (results as any).data : results;
                if (Array.isArray(clients)) {
                    if (clients.length === 1) {
                        return clients[0];
                    } else {
                        return this.feathersClient.service('clients').create({ id: this.client.clientId });
                    }
                } else { return clients; }
            }).then((client: any) => {
                this.client.update(client);
                return fetch(`${this.localDeviceUrl}/deviceInfo`);
            }).then((response: any) => {
                return response.json();
            }).then((deviceInfo: any) => {
                return this.devicesService.find({
                    query: {
                        $limit: 1,
                        user: this.user.id,
                        deviceUuid: deviceInfo.deviceUuid
                    }
                });
            }).then((results: any) => {
                const devices = (results as any).data ? (results as any).data : results;
                if (devices.length === 1) {
                    this.device.update(devices[0]);
                    return this.instancesService.create({
                        user: this.user.id,
                        client: this.client.id,
                        device: this.device.id
                    });
                } else {
                    throw new DeviceNotFoundError('A device with the given UUID couldn\'t be found.');
                }
            }).then((instance: any) => {
                this.instance.update(instance);
                console.log('[YXC] Initialized Instance:', instance);
                return this.updateInstanceActiveness()
            }).then((updatedInstance: any) => {
                console.log('[YXC] Updated Instance Activeness:', updatedInstance);
                return Promise.all([this.getResource(), this.getProxemicsState()]);
            }).then((results: any) => {
                const [resource, proxemics] = results;
                this.updateResourceSubscription()
                    .then(() => resolve([resource.data, proxemics, resource.id]))
                    .catch(e => reject(e));
            }).catch((e: Error) => {
                if (!(e instanceof Conflict)) { reject(e); }
            })
        });
    }

    public logout() { this.feathersClient.logout(); }

    public isConnected(): boolean { return this.socket.connected; }

    public getResourceData(resourceId: string = null): Promise<any> {
        return this.getResource(resourceId).then(resource => resource.data);
    }

    public setResourceData(data: any, resourceId: string = this.subscribedResourceId): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!resourceId && this.resource && this.resource.id) { resourceId = this.resource.id; }
            if (resourceId) {
                this.resourcesService
                    .patch(resourceId, { data: data })
                    .then((resource: any) => {
                        this.updateResource(resource);
                        resolve(resource.data)
                    }).catch((e: Error) => reject(e));
            } else { reject(new UnavailableResourceId('Unavailable Resource Id')) }
        });
    }

    private getResource(resourceId: string = this.subscribedResourceId): Promise<BaseResource> {
        return new Promise((resolve, reject) => {
            const retrieveResource = () => {
                let query: any;
                if (resourceId) { query = { _id: resourceId }; }
                else if (this.resource && this.resource.id) { query = { _id: this.resource.id }; }
                else { query = { $limit: 1, user: this.user.id, client: this.client.id, default: true }; }
                this.resourcesService.find({ query }).then((resources: any) => {
                    if ((<Array<any>>resources).length === 1) {
                        const resource = (<any>resources)[0];
                        if (resourceId) { resolve(new BaseResource(resource)); }
                        else { this.updateResource(resource); resolve(this.resource); }
                    } else if (!resourceId) {
                        this.resourcesService.create({ user: this.user.id, client: this.client.id, default: true })
                            .then((resource: any) => { this.updateResource(resource); return resolve(this.resource); })
                            .catch((e: Error) => {
                                if (!(e instanceof Conflict)) { reject(e); }
                                else { resolve(this.resource); }
                            });
                    } else { reject(new ResourceNotFound('Resource Not Found')); }
                }).catch((e: Error) => reject(e));
            }
            this.getResourceSubscription().then(resourceSubscription => {
                if (resourceSubscription && resourceSubscription.resource) {
                    return this.resourcesService.get(resourceSubscription.resource)
                } else { return Promise.resolve(); }
            }).then(resource => {
                if (resource) {
                    this._subscribedResourceId = this.subscribedResourceId ? this.subscribedResourceId : resource._id;
                    if (resourceId) { resolve(new BaseResource(resource)); }
                    else { this.updateResource(resource); resolve(this.resource); }
                } else { retrieveResource() }
            }).catch(e => retrieveResource());
        });
    }

    //TODO:
    //I encapsulated the response into something that has a specific type.
    //However, I should probably look for other places where I used "any" but that can have a specific type.
    public getResources(owned: boolean = true, sharedWith: boolean = true): Promise<Array<SharedResource>> {
        return new Promise((resolve, reject) => {
            const orCondition = [];
            if (owned) { orCondition.push({ user: this.user.id }) }
            if (sharedWith) { orCondition.push({ sharedWith: this.user.id }) }
            if (orCondition.length === 0) {
                throw new UnsupportedConfiguration('Must choose "owned", "sharedWith" or both');
            }
            this.resourcesService.find({
                /**
                 * TODO:
                 * Sorting by "default: -1" puts default resources at the top. Howver, it does not guarantee that the one at the top is the one owned by the current user.
                 * Therefore, I must either find a way to enforce this or I should just forbid sharing of default resources altogether.
                 */
                query: { $populate: ['user', 'sharedWith'], client: this.client.id, $or: orCondition, $sort: { default: -1 } }
            }).then((resources: any) => {
                resolve(resources.map((r: any) => new SharedResource(r)));
            }).catch((e: Error) => reject(e));
        });
    }

    public createResource(resourceName: string = ''): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            this.resourcesService.create({
                user: this.user.id,
                client: this.client.id,
                name: resourceName,
                default: false
            }).then((resource: any) => resolve(new SharedResource(resource))).catch((e: Error) => reject(e))
        });
    }

    //TODO: Ensure that only the owner can delete the resource
    public deleteResource(resourceId: string = this.subscribedResourceId): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            this.resourcesService.remove(resourceId)
                .then((resource: any) => resolve(new SharedResource(resource))).catch((e: Error) => reject(e))
        });
    }

    public renameResource(name: string, resourceId: string = this.subscribedResourceId): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            this.resourcesService.patch(resourceId, { name })
                .then((resource: any) => resolve(new SharedResource(resource))).catch((e: Error) => reject(e))
        });
    }

    public shareResource(userEmail: string, resourceId: string = this.subscribedResourceId): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.resourcesService.get(resourceId),
                this.usersService.find({ query: { $limit: 1, email: userEmail } })
            ]).then(results => {
                let [resource, users] = results;
                if (users.length !== 1) { throw new UserNotFoundError('Could not find a user with the given e-mail address.'); }
                else { return this.resourcesService.patch(resource._id, { $addToSet: { sharedWith: users[0]._id } }); }
            }).then(resource => { resolve(new SharedResource(resource)); }).catch((e: Error) => reject(e))
        });
    }

    public unshareResource(userEmail: string, resourceId: string = this.subscribedResourceId): Promise<SharedResource> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.resourcesService.get(resourceId),
                this.usersService.find({ $limit: 1, query: { email: userEmail } })
            ]).then(results => {
                let [resource, users] = results;
                if (users.length !== 1) { throw new UserNotFoundError('Could not find a user with the given e-mail address.'); }
                else { return this.resourcesService.patch(resource._id, { $pull: { sharedWith: users[0]._id } }); }
            }).then(resource => { resolve(new SharedResource(resource)); }).catch((e: Error) => reject(e))
        });
    }

    private updateResource(resource: any): void {
        if (this.resource && (!this.resource.id || this.resource.id === resource._id)) {
            this.resource.update(resource);
            if (!this.subscribedResourceId) { this._subscribedResourceId = this.resource.id; }
        }
    }

    private getResourceSubscription(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.resourceSubscriptionService.find({ query: { $limit: 1, user: this.user.id, client: this.client.id } })
                .then(resourceSubscriptions => {
                    if (resourceSubscriptions.length === 1) { resolve(resourceSubscriptions[0]); }
                    else if (resourceSubscriptions.length === 0) { resolve(); }
                }).catch(e => reject(e));
        });
    }

    public getProxemicsState(): Promise<any> {
        return this.getProxemics().then(proxemics => proxemics.state).catch((e: Error) => Promise.reject(e));
    }

    private getProxemics(): Promise<Proxemics> {
        return new Promise((resolve, reject) => {
            this.proxemicsService.find({ query: { $limit: 1, user: this.user.id } })
                .then((proxemics: any) => {
                    if ((<Array<any>>proxemics).length === 1) {
                        this.proxemics.update((<any>proxemics)[0]);
                        return resolve(this.proxemics);
                    } else {
                        this.proxemicsService.create({ user: this.user.id })
                            .then((proxemics: any) => {
                                this.proxemics.update(proxemics)
                                return resolve(this.proxemics);
                            }).catch((e: Error) => {
                                if (!(e instanceof Conflict)) { reject(e); }
                            });
                    }
                }).catch((e: Error) => reject(e));
        });
    }

    public getInstances(extraConditions: any): Promise<any> {
        const query: any = { $populate: 'device', user: this.user.id, client: this.client.id };
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
                    }).catch((e: Error) => reject(e));
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
                    }).catch((e: Error) => reject(e));
            } else { reject(new UnavailableInstanceId('Unavailable Instance Id')) }

        });
    }

    public emitEvent(value: any, name: string): Promise<any> {
        return this.eventsService.create({ value, name });
    }

    private subscribeService(
        service: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>,
        subscribeFunctions: { [eventType: string]: (entity: any) => void }
    ) {
        for (const eventType in subscribeFunctions) {
            service.on(eventType, subscribeFunctions[eventType]);
        }
    }

    private unsubscribeService(
        service: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>,
        subscribeFunctions: { [eventType: string]: (entity: any) => void }
    ) {
        for (const eventType in subscribeFunctions) {
            service.off(eventType, subscribeFunctions[eventType]);
        }
        subscribeFunctions = {};
    }

    public subscribeResource(subscriberFunction: (data: any, eventType: string) => void, resourceId: string): Promise<any> {
        if (resourceId) { this._subscribedResourceId = resourceId; }
        else if (this.resource && this.resource.id) {
            this._subscribedResourceId = this.resource.id;
        }
        const eventListener = (resource: any, eventType: string = 'updated') => {
            console.log('[YXC] Subscribed Resource:', resource, 'Event Type:', eventType);
            /**
             * TODO: This should be enforced at the Broker level.
             * I should also enforce that the Client ID of the token that is
             * used for authentication matches the provided clientId.
             * However, I have yet to find a straightforward way of doing so.
             * I will surely have to make some server-side ajustments that may
             * force me to change the way things are handled on the client-side
             * in order to provide extra security.
             */
            if (this.subscribedResourceId === resource._id &&
                this.client && this.client.id === resource.client &&
                this.user && (this.user.id === resource.user ||
                    (resource.sharedWith && resource.sharedWith.some((u: any) => u === this.user.id)))) {
                this.updateResource(resource);
                subscriberFunction(new SharedResource(resource).data, eventType);
            } else { console.error('[YXC] subscribeResource - Ignored Event Type:', eventType, 'on Resource:', resource); }
        };
        this.unsubscribeResource();
        this.subscribeResourceFunctions['created'] = (resource: any) => eventListener(resource, 'created');
        this.subscribeResourceFunctions['updated'] = (resource: any) => eventListener(resource, 'updated');
        this.subscribeResourceFunctions['patched'] = (resource: any) => eventListener(resource, 'patched');
        this.subscribeResourceFunctions['removed'] = (resource: any) => eventListener(resource, 'removed');
        this.subscribeService(this.resourcesService, this.subscribeResourceFunctions);
        return this.updateResourceSubscription();
    }

    public unsubscribeResource(): void {
        this.unsubscribeService(this.resourcesService, this.subscribeResourceFunctions);
    }

    public subscribeResources(subscriberFunction: (data: any, eventType: string) => void): void {
        const eventListener = (resource: any, eventType: string = 'updated') => {
            console.log('[YXC] Subscribed Resources:', resource, 'Event Type:', eventType);
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the 'subscribeResource' method for an explanation.]
             */
            if (this.client && this.client.id === resource.client &&
                this.user && (this.user.id === resource.user ||
                    (resource.sharedWith && resource.sharedWith.some((u: any) => u === this.user.id)))) {
                subscriberFunction(new SharedResource(resource), eventType);
            } else { console.error('[YXC] subscribeResources - Ignored Event Type:', eventType, 'on Resource:', resource); }
        };

        this.unsubscribeResources();
        this.subscribeResourcesFunctions['created'] = (resource: any) => eventListener(resource, 'created');
        this.subscribeResourcesFunctions['updated'] = (resource: any) => eventListener(resource, 'updated');
        this.subscribeResourcesFunctions['patched'] = (resource: any) => eventListener(resource, 'patched');
        this.subscribeResourcesFunctions['removed'] = (resource: any) => eventListener(resource, 'removed');
        this.subscribeService(this.resourcesService, this.subscribeResourcesFunctions);
    }

    public unsubscribeResources(): void {
        this.unsubscribeService(this.resourcesService, this.subscribeResourcesFunctions);
    }

    public subscribeResourceSubscription(subscriberFunction: (data: any, eventType: string) => void): void {
        let currentResourceSubscription: any;
        const eventListener = (resourceSubscription: any, eventType: string = 'updated') => {
            console.log('[YXC] Subscribed Resource Subscription:', resourceSubscription, 'Event Type:', eventType);
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the 'subscribeResource' method for an explanation.]
             */
            if (this.client && this.client.id === resourceSubscription.client &&
                this.user && this.user.id === resourceSubscription.user &&
                !currentResourceSubscription ||
                (currentResourceSubscription && currentResourceSubscription.resource !== resourceSubscription.resource)) {
                //TODO: Perhaps I should create ResourceSubscription class to wrap around the value returned from the broker.
                currentResourceSubscription = resourceSubscription;
                subscriberFunction(currentResourceSubscription, eventType);
            } else { console.error('[YXC] subscribeResourceSubscriptions - Ignored Event Type:', eventType, 'on ResourceSubscription:', resourceSubscription); }
        };
        this.unsubscribeResourceSubscription();
        this.subscribeResourceSubscriptionFunctions['created'] = (resource: any) => eventListener(resource, 'created');
        this.subscribeResourceSubscriptionFunctions['updated'] = (resource: any) => eventListener(resource, 'updated');
        this.subscribeResourceSubscriptionFunctions['patched'] = (resource: any) => eventListener(resource, 'patched');
        this.subscribeResourceSubscriptionFunctions['removed'] = (resource: any) => eventListener(resource, 'removed');
        this.subscribeService(this.resourceSubscriptionService, this.subscribeResourceSubscriptionFunctions);
    }

    public unsubscribeResourceSubscription(): void {
        this.unsubscribeService(this.resourceSubscriptionService, this.subscribeResourceSubscriptionFunctions);
    }

    private updateResourceSubscription(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.user.id && this.client.id && this.subscribedResourceId) {
                this.resourceSubscriptionService.patch(null,
                    { user: this.user.id, client: this.client.id, resource: this.subscribedResourceId },
                    { query: { user: this.user.id, client: this.client.id } })
                    //TODO: Create a class representing a ResouceSubscription to wrap the value resturned from server.
                    .then(resourceSubscription => resolve(resourceSubscription))
                    .catch(e => reject(e));
            } else { resolve() };
        });
    }

    public subscribeProxemics(subscriberFunction: (data: any, eventType: string) => void): void {
        const eventListener = (proxemics: any, eventType: string = 'updated') => {
            console.log('[YXC] Subscribed Proxemics:', proxemics, 'Event Type:', eventType);
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the 'subscribeResource' method for an explanation.]
             */
            if (this.proxemics && this.proxemics.id === proxemics._id &&
                this.user && this.user.id === proxemics.user) {
                if (!isEqual(proxemics.state, this.proxemics.state)) {
                    this.proxemics.update(proxemics);
                    subscriberFunction(this.proxemics.state, eventType);
                }
            } else { console.error('[YXC] subscribeProxemics - Ignored Event Type:', eventType, 'on Proxemics:', proxemics); }
        };
        this.unsubscribeProxemics();
        this.subscribeProxemicsFunctions['created'] = (resource: any) => eventListener(resource, 'created');
        this.subscribeProxemicsFunctions['updated'] = (resource: any) => eventListener(resource, 'updated');
        this.subscribeProxemicsFunctions['patched'] = (resource: any) => eventListener(resource, 'patched');
        this.subscribeProxemicsFunctions['removed'] = (resource: any) => eventListener(resource, 'removed');
        this.subscribeService(this.proxemicsService, this.subscribeProxemicsFunctions);
    }

    public unsubscribeProxemics(): void {
        this.unsubscribeService(this.proxemicsService, this.subscribeProxemicsFunctions);
    }

    public subscribeInstances(subscriberFunction: (data: any, eventType: string) => void): void {
        const eventListener = (instance: any, eventType: string = 'updated') => {
            console.log('[YXC] Subscribed Instance:', instance, 'Event Type:', eventType);
            const newInstance = new Instance(instance);
            /**
             * TODO: This should be enforced at the Broker level.
             * [Read the similar comment on the 'subscribeResource' method for an explanation.]
             */
            if (this.user && this.user.id === instance.user &&
                this.client && this.client.id === instance.client) {
                if (this.instance.id === newInstance.id) {
                    this.instance = newInstance;
                }
                if (eventType === 'removed' || !newInstance.equals(this.cachedInstances.get(newInstance.id))) {
                    subscriberFunction(instance, eventType);
                }
                this.cachedInstances.set(newInstance.id, newInstance);
                this.cleanUpCachedInstances();
            } else { console.error('[YXC] subscribeInstances - Ignored Event Type:', eventType, 'on Instance:', instance); }
        };
        this.unsubscribeInstances();
        this.subscribeInstancesFunctions['created'] = (resource: any) => eventListener(resource, 'created');
        this.subscribeInstancesFunctions['updated'] = (resource: any) => eventListener(resource, 'updated');
        this.subscribeInstancesFunctions['patched'] = (resource: any) => eventListener(resource, 'patched');
        this.subscribeInstancesFunctions['removed'] = (resource: any) => eventListener(resource, 'removed');
        this.subscribeService(this.instancesService, this.subscribeInstancesFunctions);
    }

    public unsubscribeInstances(): void {
        this.unsubscribeService(this.instancesService, this.subscribeInstancesFunctions);
    }

    private cleanUpCachedInstances(): void {
        this.cachedInstances.forEach((instance: Instance) => {
            if (new Date().getTime() - instance.timestamp.getTime() > FeathersCoordinator.CACHED_INSTANCES_MAX_AGE) {
                this.cachedInstances.delete(instance.id);
            }
        });
    }

    public subscribeEvents(subscriberFunction: (data: any, eventType: string) => void): void {
        const eventListener = (event: any, eventType: string = 'created') => {
            console.log('[YXC] Subscribed Event:', event, 'Event Type:', eventType);
            subscriberFunction(event, eventType);
        };
        this.unsubscribeEvents();
        this.subscribeEventsFunction = (event: any) => eventListener(event, 'created');
        this.eventsService.on('created', this.subscribeEventsFunction);
    }

    public unsubscribeEvents(): void {
        this.eventsService.off('created', this.subscribeEventsFunction);
        this.subscribeEventsFunction = null;
    }

    public subscribeReconnects(subscriberFunction: (resourceState: any, proxemics: any, resourceId: any) => void): void {
        this.subscribeReconnectsFunction = subscriberFunction;
    }

    public unsubscribeReconnects(): void {
        this.subscribeReconnectsFunction = null;
    }
}
