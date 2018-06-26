import feathersAuthClient from "@feathersjs/authentication-client";
import { Conflict } from "@feathersjs/errors";
import feathers, { Application, ServiceAddons, ServiceMethods, ServiceOverloads } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import * as Promise from 'bluebird';
import * as io from "socket.io-client";
import AbstractCoordinator from "./AbstractCoordinator";
import App from "./App";
import User from "./User";
import Resource from "./Resource";
import ResourceNotFound from "./errors/ResourceNotFoundError";
export default class FeathersCoordinator extends AbstractCoordinator {
    private resource: Resource;
    private socket: SocketIOClient.Socket;
    private client: Application<object>;
    private service: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;
    private storage: Storage;

    constructor(url: string, app: App, user: User, localStorageLocation: string = "./data/localstorage") {
        super();
        this.resource = new Resource(app, user);
        this.socket = io(url);
        this.client = feathers();
        this.client.configure(socketio(this.socket));
        this.service = this.client.service('resources');

        if (typeof window.localStorage === "undefined" || window.localStorage === null) {
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
            this.client.authenticate({
                strategy: 'local',
                email: this.resource.user.username,
                password: this.resource.user.credentials
            }).then(response => {
                if (subscriberFunction) {
                    this.subscribe(subscriberFunction);
                }
                return this.service.create({
                    app: this.resource.app.name,
                    user: this.resource.user.username
                });
            }).then(resource => resolve(this.getData()))
                .catch(err => {
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
                    user: this.resource.user.username,
                    app: this.resource.app.name
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
            // TODO: This should be enforced at the Broker level.
            if (this.resource.id === resource._id
                && this.resource.app.name === resource.app
                && this.resource.user.username === resource.user) {
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
