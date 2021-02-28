import { isEqual } from 'lodash';
import BaseEntity from './BaseEntity';
import ComponentsDistribution from './ComponentsDistribution'

/**
 * A class that represents a running {@link Instance} of {@link Client} application on a certain {@link Device}.
 */
export class Instance extends BaseEntity {
    /**
     * The Id of the {@link User} that owns the {@link Instance}.
     */
    public userId: string;
    /**
     * The Id of the {@link Client} application that the {@link Instance} belongs to.
     */
    public clientId: string;
    /**
     * The Id of the {@link Device} where the {@link Instance} is running.
     */
    public deviceId: string;
    /**
     * The Id of the {@link User}s with whom this {@link Instance} is shared.
     */
    public sharedWithIds: string[];
    /**
     * The Id of the {@link User}s with whom this {@link Instance} was previously shared 
     * (to detect if there was a share/unshare operation).
     */
    public prevSharedWithIds: string[];
    /**
     * The UUID that uniquily identifies the {@link Instance}.
     */
    public instanceUuid: string;
    /**
     * The name of the {@link Instance}.
     */
    public name: string;
    /**
     * It indicates whether the {@link Instance} is in use (true) or not (false).
     */
    public active: Boolean;
    /**
     * The current distribution of UI components on this {@link Instance}.
     */
    public componentsDistribution: ComponentsDistribution;

    /**
     * A constructor that creates a {@link Instance} object from a plain client object received from the broker.
     * @param instance - A plain object received from the broker with information about an {@link Instance}.
     */
    constructor(instance: any = {}) {
        super(instance);
    }

    /**
     * It updates the current object with information from a plain object received from the broker.
     * @param instance - A plain object received from the broker with information about an {@link Instance}.
     */
    public update(instance: any): void {
        super.update(instance);
        this.userId = instance.user && instance.user._id ? instance.user._id : instance.user;
        this.clientId = instance.client && instance.client._id ? instance.client._id : instance.client;
        this.deviceId = instance.device && instance.device._id ? instance.device._id : instance.device;
        this.sharedWithIds = instance.sharedWith ? instance.sharedWith.map((u: any) => u._id ? u._id : u) : [];
        this.prevSharedWithIds = instance.prevSharedWith ? instance.prevSharedWith.map((u: any) => u._id ? u._id : u) : [];
        this.instanceUuid = instance.instanceUuid;
        this.name = instance.name;
        this.active = instance.active;
        this.componentsDistribution = new ComponentsDistribution(instance.componentsDistribution);
    }

    /**
     * A method that compares the current object with another object to determine if their values are equivalent.
     * @param instance - The object to compare to.
     */
    public equals(instance: any): boolean {
        return super.equals(instance)
            && this.active === instance.active
            && this.instanceUuid === instance.instanceUuid
            && (isEqual(this.sharedWithIds, instance.sharedWith) || isEqual(this.sharedWithIds, instance.sharedWithIds))
            && (isEqual(this.prevSharedWithIds, instance.prevSharedWith) || isEqual(this.prevSharedWithIds, instance.prevSharedWithIds))
            && isEqual(this.componentsDistribution, new ComponentsDistribution(instance.componentsDistribution))
    }
}

export default Instance;