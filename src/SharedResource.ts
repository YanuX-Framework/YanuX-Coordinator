import DefaultResource from "./Resource";

export default class SharedResource extends DefaultResource {
    public owner: string;
    public name: string;
    public default: boolean;
    constructor(resource: any = {}) {
        super(resource);
    }
    public update(resource: any): void {
        super.update(resource);
        this.owner = resource.user.email;
        this.name = resource.name;
        this.default = resource.default;
    }

}