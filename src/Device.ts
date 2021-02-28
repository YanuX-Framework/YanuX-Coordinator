import BaseEntity from './BaseEntity'

/**
 * A class that represents a device that is using a {@link Client} application.
 */
export class Device extends BaseEntity{
    /**
     * The Id of the {@link User} that owns the the {@link Device}.
     */
    public userId: string;
    /**
     * The UUID that uniquely identifies the {@link Device}.
     */
    public deviceUuid: string;
    /**
     * The name of the {@link Device}.
     */
    public name: string;
    /**
     * An array with the values of the beacon that identifies the {@link Device}.
     * For instance, [uuid, major, minor].
     */
    public beaconValues: any[];

    /**
     * constructor that crestes a {@link Device} object from a plain client object received from the broker.
     * @param device - A plain object received from the broker with information about a {@link Device}. 
     */
    constructor(device: any = {}) {
        super(device);
    }

    /**
     * It updates the current object with information from a plain object received from the broker.
     * @param device - A plain object received from the broker with information about a {@link Device}. 
     */
    public update(device: any): void {
        super.update(device);
        this.userId = device.user && device.user._id ? device.user._id : device.user;
        this.deviceUuid = device.deviceUuid;
        this.beaconValues = device.beaconValues;
        this.name = device.name;
    }
}

export default Device;