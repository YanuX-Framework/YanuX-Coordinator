/// <reference types="bluebird" />
/// <reference types="socket.io-client" />
/// <reference types="@feathersjs/feathers" />
/// <reference types="@feathersjs/errors" />
/// <reference types="@feathersjs/socketio-client" />
/// <reference types="@feathersjs/authentication-client" />


import AbstractCoordinator from "./AbstractCoordinator";
import User from "./User";
import App from "./App";

import * as Promise from 'bluebird';
import * as io from "socket.io-client";
import feathers, { Application, ServiceOverloads, ServiceAddons, ServiceMethods } from "@feathersjs/feathers";
import { Conflict } from "@feathersjs/errors";
import socketio from "@feathersjs/socketio-client";
import feathersAuthClient from "@feathersjs/authentication-client";
import { promises } from "fs";

export default class FeathersCoordinator { //extends AbstractCoordinator {
    private app: App;
    private user: User;
    private socket: SocketIOClient.Socket;
    private client: Application<object>;
    private service: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;

    constructor(url: string, app: App, user: User) {
        //super();
        this.app = app;
        this.user = user;
        this.socket = io(url);
        this.client = feathers();
        this.client.configure(socketio(this.socket));
        this.service = this.client.service('resources');
        this.client.configure(feathersAuthClient())
    }

    public init(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.authenticate({
                strategy: 'local',
                email: this.user.username,
                password: this.user.credentials
            }).then(response => this.service.create({
                app: this.app.name,
                user: this.user.username
            })).then(response => resolve())
                .catch(err => {
                    if (!(err instanceof Conflict)) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
        });
    }

    public getState(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.service.find({ query: { user: this.user.username, app: this.app.name } }).then(response => {
                return resolve((<any>response)[0]);
            }).catch(err => reject(err));
        });
    }
}
// TODO: This is the old DeepStream based prototypical implementation. I'm just pasting it here for reference until I finish porting everything to FeathersJS.
/*export default class DeepstreamCoordinator extends AbstractCoordinator {
    private _deepstreamConnection: deepstreamIO.deepstreamQuarantine;
    constructor(url: string, app: App, user: User) {
        super();
        this._deepstreamConnection = deepstream(url);
        this.getDeepstreamConnection().login(user, (success, data) => {
            if (success) {
                console.debug("Login Successful: " + this.getDeepstreamConnection().getConnectionState());
            } else {
                console.debug("Login Unsuccessful: " + this.getDeepstreamConnection().getConnectionState());
            }
        });
        this.uiState = this.getDeepstreamConnection().record.getRecord("/record/user/" + user.username + "/app/" + app.name);
    }
    public getUiState(): any {
        return this.uiState.get();
    }
    public setUiState(uiState: any) {
        this.uiState.set(uiState);
    }
    public subscribeUiState(subscriberFunction: (data: any) => void) {
        this.uiState.subscribe(subscriberFunction);
    }
    public getDeepstreamConnection(): deepstreamIO.deepstreamQuarantine {
        return this._deepstreamConnection;
    }
}*/

