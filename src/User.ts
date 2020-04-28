import BaseEntity from "./BaseEntity";

export default class User extends BaseEntity {
    public email: string;

    constructor(resource: any = {}) {
        super(resource);
    }

    public update(resource: any): void {
        super.update(resource);
        this.email = resource.email;
    }
}