import feathersAuthClient from "@feathersjs/authentication-client";
import { Conflict } from "@feathersjs/errors";
import feathers, { Application, ServiceAddons, ServiceMethods, ServiceOverloads, Paginated } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import * as Promise from 'bluebird';
import * as io from "socket.io-client";
import AbstractCoordinator from "./AbstractCoordinator";
import Credentials from "./Credentials";
import Resource from "./Resource";
import ResourceNotFound from "./errors/ResourceNotFoundError";
export default class FeathersCoordinator extends AbstractCoordinator {
    private resource: Resource;
    private socket: SocketIOClient.Socket;
    private client: Application<object>;
    private service: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private storage: Storage;

    constructor(url: string, clientName: string, credentials: Credentials, localStorageLocation: string = "./data/localstorage") {
        super();
        this.resource = new Resource(clientName, credentials);
        this.socket = io(url);
        this.client = feathers();
        this.client.configure(socketio(this.socket));
        this.service = this.client.service('resources');

        if ((typeof window === "undefined" || window === null) ||
            (typeof window.localStorage === "undefined" || window.localStorage === null)) {
            let NodeLocalStorage = require('node-localstorage').LocalStorage
            this.storage = new NodeLocalStorage(localStorageLocation);
        } else {
            this.storage = window.localStorage;
        }
        this.client.configure(feathersAuthClient({ storage: this.storage }));

        // TODO: Implement a proper generic logger system that I can use across this whole project (perhaps across all my projects).
        let eventCallback: any = (evenType: string) => (event: any) => console.log(evenType + ":", event);
        this.client.on('authenticated', eventCallback('authenticated'));
        this.client.on('logout', eventCallback('logout'))
        this.client.on('reauthentication-error', eventCallback('reauthentication-error'))
    }

    public init(subscriberFunction: (resource: any, eventType: string) => void = null): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const auth: any = {};
            switch (this.resource.credentials.type) {
                case 'yanux':
                    auth['strategy'] = 'yanux';
                    auth['accessToken'] = this.resource.credentials.values[0];
                    break;
                case 'local':
                default:
                    auth['strategy'] = 'local';
                    auth['email'] = this.resource.credentials.values[0];
                    auth['password'] = this.resource.credentials.values[1];
                    break;
            }
            this.client.authenticate(auth)
                .then(response => {
                    return this.client.passport.verifyJWT(response.accessToken);
                }).then(payload => {
                    return this.client.service('users').get(payload.userId);
                }).then(user => {
                    this.resource.userId = user;
                    return user;
                }).then(() => {
                    return this.client.service('clients').find({ query: { name: this.resource.clientName } });
                }).then(queryResult => {
                    const clients: Paginated<any> = queryResult as Paginated<any>;
                    if (clients.total === 1) {
                        return clients.data[0];
                    } else if (clients.total === 0) {
                        return this.client.service('clients').create({ name: this.resource.clientName });
                    } else {
                        throw new Error('The impossible has happened! There is more than a single client with the same UNIQUE name.');
                    }
                }).then(client => {
                    this.resource.clientId = client._id;
                    if (subscriberFunction) {
                        this.subscribe(subscriberFunction);
                    }
                    return this.service.create({
                        client: this.resource.clientId,
                        user: this.resource.userId._id
                    });
                })
                .then(resource => resolve(this.getData())).catch(err => {
                    if (!(err instanceof Conflict)) {
                        reject(err);
                    } else {
                        return resolve(this.getData());
                    }
                });
        });
    }

    private getResource(): Promise<Resource> {
        return new Promise((resolve, reject) => {
            this.service.find({
                query: {
                    user: this.resource.userId._id,
                    client: this.resource.clientId
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
            this.service.patch(this.resource.id, { data: data })
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
             * used for authentication matches the the provided clientName.
             * However, I have yet to find a straightforward way of doing so.
             * I will surely have to make some server-side ajustments that may
             * force me to change the way things are handled on the client-side
             * in order to provide extra security.
             */
            if (this.resource.id === resource._id
                && this.resource.clientId === resource.client
                && this.resource.userId === resource.user) {
                this.resource.update(resource);
                subscriberFunction(this.resource.data, eventType);
            } else {
                console.error('I\'m getting events that I shouldn\'t have heard about.');
            }
        };
        this.service.on('updated', resource => eventListener(resource, 'updated'));
        this.service.on('patched', resource => eventListener(resource, 'patched'));
    }
}
