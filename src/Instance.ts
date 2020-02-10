import _ from 'lodash'
import ComponentsDistribution from './ComponentsDistribution'

export default class Instance {
    public id: string;
    public active: Boolean;
    public instanceUuid: String;
    public componentsDistribution: ComponentsDistribution;
    public createdAt: Date;
    public updatedAt: Date;
    public timestamp: Date;
    public _raw: any;

    constructor(instance: any = {}) {
        this.update(instance);
    }

    public update(instance: any): void {
        this.id = instance._id;
        this.active = instance.active;
        this.instanceUuid = instance.instanceUuid;
        this.componentsDistribution = new ComponentsDistribution(instance.componentsDistribution);
        this.createdAt = new Date(instance.createdAt);
        this.updatedAt = new Date(instance.updatedAt);
        this.timestamp = new Date();
        this._raw = instance;
    }

    public equals(instance: any): boolean {
        return !_.isNil(instance)
            && (this.id === instance.id || this.id === instance._id)
            && this.active === instance.active
            && this.instanceUuid === instance.instanceUuid
            && _.isEqual(this.componentsDistribution, new ComponentsDistribution(instance.componentsDistribution))
    }

    public get raw(): any {
        return this._raw;
    }

    public set raw(raw: any) {
        this._raw = raw;
        this.update(this.raw);
    }
}
