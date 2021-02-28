import Resource from "./Resource";
import User from "./User";

/**
 * A class representing a {@link Resource} on the broker but with some extended information about the users with which the {@link Resource} is shared.
 * Depending on who called the {@link SharedResource} constructor the additional fields may be populated or not. 
 * It all depends on whether the broker was instructed to populate those fields or not.
 * @todo Pay more atthention to where I'm using {@link Resource} vs. {@link SharedResource}. 
 * I may have to "downgrade" some {@link SharedResource}s to {@link Resource}s 
 * when I'm sure that {@link SharedResource.user} and {@link SharedResource.sharedWith} were not populated. 
 */
export class SharedResource extends Resource {
    /**
     * The {@link User} that owns this {@link Resource}.
     * @remarks This value may not be fully initialized if the object passed to create this {@link SharedResource} was not fully populated.
     */
    public user: User;
    /**
     * The e-mail of the {@link User} that owns this {@link Resource}.
     * @remarks This value may not be fully initialized if the object passed to create this {@link SharedResource} was not fully populated.
     */
    public owner: string;
    /**
     * The {@link User}s with whom this {@link Resource} is shared.
     * @remarks This value may not be fully initialized if the object passed to create this {@link SharedResource} was not fully populated.
     */
    public sharedWith: Array<User>;

    /**
     * A constructor that creates a {@link SharedResource} object from a plain client object received from the broker.
     * @param resource - A plain object received from the broker with information about a {@link SharedResource}.
     */
    constructor(resource: any = {}) {
        super(resource);
    }

    /**
     * It updates the current object with information from a plain object received from the broker.
     * @param resource - A plain object received from the broker with information about a {@link SharedResource}.
     */
    public update(resource: any): void {
        super.update(resource);
        this.user = new User(resource.user);
        this.owner = this.user.email;
        this.sharedWith = resource.sharedWith.map((u: any) => new User(u));
    }
}

export default SharedResource;