/// <reference types="socket.io-client" />
/// <reference types="@feathersjs/feathers" />
/// <reference types="@feathersjs/errors" />
/// <reference types="@feathersjs/socketio-client" />
/// <reference types="@feathersjs/authentication-client" />


import AbstractCoordinator from "./AbstractCoordinator";
import User from "./User";
import App from "./App";

import * as io from "socket.io-client";
import feathers, { Application, ServiceOverloads, ServiceAddons, ServiceMethods } from "@feathersjs/feathers";
import { Conflict } from "@feathersjs/errors";
import socketio from "@feathersjs/socketio-client";
import feathersAuthClient from "@feathersjs/authentication-client";

export default class FeathersCoordinator { //extends AbstractCoordinator {
    private _socket: SocketIOClient.Socket;
    private _client: Application<object>;
    private _service: ServiceOverloads<any> & ServiceAddons<any> & ServiceMethods<any>;

    constructor(url: string, app: App, user: User) {
        //super();
        this._socket = io(url);
        this._client = feathers();
        this._client.configure(socketio(this._socket));
        this._service = this._client.service('resources');
        this._client.configure(feathersAuthClient())
        this._client.authenticate({
            strategy: 'local',
            email: user.username,
            password: user.credentials.password
        }).then(response => {
            console.log('Login: ', response);
            return this._service.create({
                app: app.name,
                user: user.username
            })
        }).then(result => {
            console.log('Result: ', result);
        }).catch(err => {
            if (err instanceof Conflict) {
                console.log('This is not the first time that you are using this application.', err);
            } else {
                console.error(err)
            }
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

