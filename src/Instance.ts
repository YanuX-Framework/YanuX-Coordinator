import { isEqual } from 'lodash';
import BaseEntity from './BaseEntity';
import ComponentsDistribution from './ComponentsDistribution'

export default class Instance extends BaseEntity {
    public active: Boolean;
    public instanceUuid: String;
    public componentsDistribution: ComponentsDistribution;

    public timestamp: Date;

    constructor(instance: any = {}) {
        super(instance);
    }

    public update(instance: any): void {
        super.update(instance);
        this.active = instance.active;
        this.instanceUuid = instance.instanceUuid;
        this.componentsDistribution = new ComponentsDistribution(instance.componentsDistribution);
        this.timestamp = new Date();
    }

    public equals(instance: any): boolean {
        return super.equals(instance)
            && this.active === instance.active
            && this.instanceUuid === instance.instanceUuid
            && isEqual(this.componentsDistribution, new ComponentsDistribution(instance.componentsDistribution))
    }
}
