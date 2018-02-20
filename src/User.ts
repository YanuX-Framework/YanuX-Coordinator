export default class User {
    private _username: string;
    private _credentials: any;
    constructor(username: string, credentials: any = {}) {
        this.username = username;
        this.credentials = credentials;
    }
    public get username(): string {
        return this._username;
    }
    public set username(username: string) {
        this._username = username;
    }
    public get credentials(): object {
        return this._credentials;
    }
    public set credentials(credentials: object) {
        this._credentials = credentials;
        if (this._credentials.username === undefined) {
            this._credentials.username = this.username;
        }
    }
}