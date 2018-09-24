import Credentials from "./Credentials";

export default class Resource {
    public id: string;
    public clientId: string;
    public clientName: string;
    public userId: any;
    public credentials: Credentials;
    public data: any;
    public createdAt: Date;
    public updatedAt: Date;
    private lastResourceChange: any;

    constructor(clientName: string, credentials: Credentials, resource: any = {}) {
        this.clientName = clientName;
        this.credentials = credentials;
        this.update(resource);
    }

    public update(resource: any): void {
        this.id = resource._id;
        this.userId = resource.user || this.userId;
        this.clientId = resource.client || this.clientId;
        this.data = resource.data;
        this.createdAt = new Date(resource.createdAt);
        this.updatedAt = new Date(resource.updatedAt);
        // Saving the full object "just in case".
        this.lastResourceChange = resource;
    }
}