import BaseEntity from './BaseEntity'

export class Device extends BaseEntity{
    public userId: string;
    public deviceUuid: string;
    public name: string;
    public beaconValues: any[];

    constructor(device: any = {}) {
        super(device);
    }

    update(device: any): any {
        super.update(device);
        this.userId = device.user && device.user._id ? device.user._id : device.user;
        this.deviceUuid = device.deviceUuid;
        this.beaconValues = device.beaconValues;
        this.name = device.name;
    }
}

export default Device;