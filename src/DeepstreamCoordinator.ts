/// <reference types="deepstream.io-client-js" />
import * as deepstream from "deepstream.io-client-js";
import AbstractCoordinator from "./AbstractCoordinator";
import User from "./User";
import App from "./App";

export default class DeepstreamCoordinator extends AbstractCoordinator {
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
}