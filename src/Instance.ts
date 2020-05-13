import { isEqual } from 'lodash';
import BaseEntity from './BaseEntity';
import ComponentsDistribution from './ComponentsDistribution'

export default class Instance extends BaseEntity {
    public userId: string;
    public clientId: string;
    public deviceId: string;
    public sharedWithIds: string[];
    public prevSharedWithIds: string[];
    public instanceUuid: string;
    public name: string;
    public active: Boolean;
    public componentsDistribution: ComponentsDistribution;
    public timestamp: Date;

    constructor(instance: any = {}) {
        super(instance);
    }

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
        this.timestamp = new Date();
    }

    public equals(instance: any): boolean {
        return super.equals(instance)
            && this.active === instance.active
            && this.instanceUuid === instance.instanceUuid
            && (isEqual(this.sharedWithIds, instance.sharedWith) || isEqual(this.sharedWithIds, instance.sharedWithIds))
            && (isEqual(this.prevSharedWithIds, instance.prevSharedWith) || isEqual(this.prevSharedWithIds, instance.prevSharedWithIds))
            && isEqual(this.componentsDistribution, new ComponentsDistribution(instance.componentsDistribution))
    }
}
