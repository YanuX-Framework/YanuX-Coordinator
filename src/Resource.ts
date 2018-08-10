import App from "./App";
import User from "./User";

export default class Resource {
    public id: string;
    public app: App;
    public user: User;
    public data: any;
    public createdAt: Date;
    public updatedAt: Date;
    private lastResourceChange: any;

    constructor(app: App, user: User, resource: any = {}) {
        this.app = app;
        this.user = user;
        this.update(resource);
    }

    public update(resource: any): void {
        this.id = resource._id;
        this.app.name = resource.app ? resource.app : this.app.name;
        this.user.username = resource.user ? resource.user : this.user.username;
        this.data = resource.data;
        this.createdAt = new Date(resource.createdAt);
        this.updatedAt = new Date(resource.updatedAt);
        // Saving the full object "just in case".
        this.lastResourceChange = resource;
    }
}