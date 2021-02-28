import BaseEntity from "./BaseEntity";

import { isEqual } from 'lodash';

/**
 * A class representing a {@link Resource} on the broker.
 */
export class Resource extends BaseEntity {
    /**
     *  The Id of the {@link User} that owns this {@link Resource}.
     */
    public userId: string;
    /**
     * The Id of the {@link Client} application that the {@link Resource} belongs to.
     */
    public clientId: string;
    /**
     * The Id of the {@link User}s with whom this {@link Resource} is shared.
     */
    public sharedWithIds: string[];
    /**
     * The name of the {@link Resource}.
     */
    public name: string;
    /**
     * Whether this is the default {@link Resource} of a given {@link User} and {@link Client} combination.
     * True if it is, false if it isn't.
     */
    public default: boolean;
    /**
     * The unstructured data that 
     */
    public data: any;

    /**
     * A constructor that creates a {@link Resource} object from a plain client object received from the broker.
     * @param resource - A plain object received from the broker with information about a {@link Resource}.
     */
    constructor(resource: any = {}) {
        super(resource);
    }

    /**
     * It updates the current object with information from a plain object received from the broker.
     * @param resource - A plain object received from the broker with information about a {@link Resource}.
     */
    public update(resource: any): void {
        super.update(resource);
        this.userId = resource.user && resource.user._id ? resource.user._id : resource.user;
        this.clientId = resource.client && resource.client._id ? resource.client._id : resource.client;
        this.sharedWithIds = resource.sharedWith ? resource.sharedWith.map((u: any) => u._id ? u._id : u) : [];
        this.name = resource.name;
        this.default = resource.default;
        this.data = resource.data;
    }

    /**
     * A method that compares the current object with another object to determine if their values are equivalent.
     * @param resource - The object to compare to.
     */
    public equals(resource: any): boolean {
        return super.equals(resource)
            && this.userId === (resource.userId || resource.user || resource.user.id || resource.user._id)
            && this.clientId === (resource.clientId || resource.client || resource.client.id || resource.client._id)
            && (isEqual(this.sharedWithIds, resource.sharedWith) || isEqual(this.sharedWithIds, resource.sharedWithIds))
            && this.name === resource.name
            && this.default === resource.default
            && isEqual(this.data, resource.data)
    }
}

export default Resource;