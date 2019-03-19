export default class Client {
    public id: string;
    
    private _raw: any;
    public get raw() : any {
        return this._raw;
    }
    public set raw(raw : any) {
        this._raw = raw;
        this.update(this.raw);
    }

    constructor(clientId: string, raw: any = null) {
        this.id = clientId;
        if (raw) {
            this._raw = raw
        }
    }

    update(client: any): any {
        this.id = client.id;
        this._raw = client;
    }
}