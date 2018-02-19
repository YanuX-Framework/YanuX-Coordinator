/// <reference types="deepstream.io-client-js" />
import * as deepstream from "deepstream.io-client-js";

export class Coordinator {
    deepstreamConnection: deepstreamIO.deepstreamQuarantine;
    constructor(url: string, credentials: object) {
        this.deepstreamConnection = deepstream(url);
        this.deepstreamConnection.login(credentials, (success, data) => {
            if (success) {
              console.log("Login Successful: "+this.deepstreamConnection.getConnectionState());
            } else {
              console.log("Login Unsuccessful: "+this.deepstreamConnection.getConnectionState());
            }
          });
    }
}