import BaseEntity from "./BaseEntity";

export default class BaseResource extends BaseEntity {
    public data: any;

    constructor(resource: any = {}) {
        super(resource);
    }

    public update(resource: any): void {
        super.update(resource);
        this.data = resource.data;
    }
}