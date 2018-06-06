//TODO: Flesh-out this class with other important user properties.
export default class User {
    private _username: string;
    private _credentials: any;
    constructor(username: string, credentials: any) {
        this.username = username;
        this.credentials = credentials;
    }
    public get username(): string {
        return this._username;
    }
    public set username(username: string) {
        this._username = username;
    }
    public get credentials(): any {
        return this._credentials;
    }
    public set credentials(credentials: any) {
        this._credentials = credentials;
    }
}