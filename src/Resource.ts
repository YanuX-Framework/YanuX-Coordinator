import Credentials from "./Credentials";

export default class Resource {
    public id: string;
    public clientId: string;
    public client: any;
    public user: any;
    public credentials: Credentials;
    public data: any;
    public createdAt: Date;
    public updatedAt: Date;
    private rawResource: any;

    constructor(clientId: string, credentials: Credentials, resource: any = {}) {
        this.clientId = clientId;
        this.credentials = credentials;
        this.update(resource);
    }

    public update(resource: any): void {
        this.id = resource._id;
        //this.user = resource.user || this.user;
        //this.client = resource.client || this.client;
        this.data = resource.data;
        this.createdAt = new Date(resource.createdAt);
        this.updatedAt = new Date(resource.updatedAt);
        // Saving the full object "just in case".
        this.rawResource = resource;
    }
}