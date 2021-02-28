import BaseEntity from "./BaseEntity";

/**
 * A class representing the information of a {@link User} stored by the broker.
 */
export class User extends BaseEntity {
    /**
     * The user's e-mail address.
     */
    public email: string;

    /**
     * A constructor that creates a {@link User} object from a plain client object received from the broker.
     * @param user - A plain object received from the broker with information about a {@link User}.
     */
    constructor(user: any = {}) {
        super(user);
    }

    /**
     * It updates the current object with information from a plain object received from the broker.
     * @param user - A plain object received from the broker with information about a {@link User}.
     */
    public update(user: any): void {
        super.update(user);
        this.email = user.email;
    }
}

export default User;