import Credentials from "./Credentials";

export default class Resource {
    public id: string;
    public data: any;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(resource: any = {}) {
        this.update(resource);
    }

    public update(resource: any): void {
        this.id = resource._id;
        this.data = resource.data;
        this.createdAt = new Date(resource.createdAt);
        this.updatedAt = new Date(resource.updatedAt);
    }
}