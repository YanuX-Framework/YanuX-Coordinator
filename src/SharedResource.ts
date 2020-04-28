import BaseResource from "./BaseResource";
import User from "./User";

export default class SharedResource extends BaseResource {
    public user: User;
    public owner: string;
    public sharedWith: Array<User>;
    public name: string;
    public default: boolean;

    constructor(resource: any = {}) {
        super(resource);
    }

    public update(resource: any): void {
        super.update(resource);
        this.user = new User(resource.user);
        this.owner = this.user.email;
        this.sharedWith = resource.sharedWith.map((u: any) => new User(u));
        this.name = resource.name;
        this.default = resource.default;
    }

}