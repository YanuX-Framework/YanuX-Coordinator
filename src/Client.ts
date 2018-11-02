export default class Client {
    public id: string;
    public raw: any;
    constructor(clientId: string, raw: any = {}) {
        this.id = clientId;
        this.raw = raw
    }
}