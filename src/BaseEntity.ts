import { isNil } from 'lodash';

export default class BaseEntity {
    public id: string;
    public brokerName: string;
    public createdAt: Date;
    public updatedAt: Date;

    private _raw: any;
    protected get raw(): any {
        return this._raw;
    }
    protected set raw(raw: any) {
        this.update(raw);
    }

    constructor(entity: any = {}) {
        this.update(entity);
    }

    update(entity: any): any {
        this.id = entity._id
        this.brokerName = entity.brokerName;
        this.createdAt = new Date(entity.createdAt);
        this.updatedAt = new Date(entity.updatedAt);
        //this._raw = entity;
    }

    public equals(entity: any): boolean {
        return !isNil(entity) && (this.id === entity.id || this.id === entity._id)
    }
}