import { isEqual } from 'lodash';
import BaseEntity from "./BaseEntity";

/**
 * A class that represents the information about the proxemic state of {@link Device}s that are owned by the user
 * or that are currently shared with him because of the subscription to a {@link SharedResource}.
 */
export class Proxemics extends BaseEntity {
    /**
     *  The Id of the {@link User} that owns this {@link Proxemics} object.
     */
    public userId: string;
    /**
     * The Id of the {@link User}s with whom this {@link Proxemics} object is shared.
     */
    public sharedWithIds: string[];
    /**
     * The Id of the {@link User}s with whom this {@link Proxemics} object was previously shared 
     * (to detect if there was a share/unshare operation).
     */
    public prevSharedWithIds: string[];
    /**
     * The state with the proxemic information and capabilities of a device, i.e., if a device is present in the environment this object should contain a key
     * with its UUID that points to an object that represents the device capabilities.    
     * @todo The proxemics state should probably be more formally described and structured with a type especially created for it.
     */
    public state: { [deviceUuid: string]: any };

    /**
      * A constructor that creates a {@link Proxemics} object from a plain client object received from the broker.
      * @param proxemics - A plain object received from the broker with information about a {@link Proxemics}.
      */
    constructor(proxemics: any = {}) {
        super(proxemics);
        this.update(proxemics);
    }

    /**
     * It updates the current object with information from a plain object received from the broker.
     * @param proxemics - A plain object received from the broker with information about a {@link Proxemics}.
     */
    public update(proxemics: any): void {
        super.update(proxemics);
        this.userId = proxemics.user && proxemics.user._id ? proxemics.user._id : proxemics.user;
        this.sharedWithIds = proxemics.sharedWith ? proxemics.sharedWith.map((u: any) => u._id ? u._id : u) : [];
        this.prevSharedWithIds = proxemics.prevSharedWithIds ? proxemics.prevSharedWithIds.map((u: any) => u._id ? u._id : u) : [];
        this.state = proxemics.state;
    }

    /**
     * A method that compares the current object with another object to determine if their values are equivalent.
     * @param proxemics - The object to compare to.
     */
    public equals(proxemics: any): boolean {
        return super.equals(proxemics)
            && this.userId === (proxemics.userId || (proxemics.user && proxemics.user._id ? proxemics.user._id : proxemics.user))
            && (isEqual(this.sharedWithIds, proxemics.sharedWith) || isEqual(this.sharedWithIds, proxemics.sharedWithIds))
            && (isEqual(this.prevSharedWithIds, proxemics.prevSharedWith) || isEqual(this.prevSharedWithIds, proxemics.prevSharedWithIds))
            && isEqual(this.state ? Object.keys(this.state) : null, proxemics.state ? Object.keys(proxemics.state) : null) //&& isEqual(this.state, proxemics.state)
    }
}

export default Proxemics;