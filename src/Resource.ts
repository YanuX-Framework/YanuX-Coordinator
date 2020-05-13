import BaseEntity from "./BaseEntity";

export default class Resource extends BaseEntity {
    public userId: string;
    public clientId: string;
    public sharedWithIds: string[];
    public name: string;
    public default: boolean;
    public data: any;

    constructor(resource: any = {}) {
        super(resource);
    }

    public update(resource: any): void {
        super.update(resource);
        this.userId = resource.user && resource.user._id ? resource.user._id : resource.user;
        this.clientId = resource.client && resource.client._id ? resource.client._id : resource.client;
        this.sharedWithIds = resource.sharedWith ? resource.sharedWith.map((u: any) => u._id ? u._id : u) : [];
        this.name = resource.name;
        this.default = resource.default;
        this.data = resource.data;
    }
}