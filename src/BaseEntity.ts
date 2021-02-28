import { isNil } from 'lodash';

/**
 * Base entity for all the other entities that "mirror" the information stored by the broker.
 */
export class BaseEntity {
    /**
     * The entity Id
     */
    public id: string;
    /**
     * The unique name of the broker that the entity came from.
     */
    public brokerName: string;
    /**
     * The date when the entity was created at the broker.
     */
    public createdAt: Date;
    /**
     * The date when the entity was updated at the broker.
     */
    public updatedAt: Date;
    /**
     * The date when the entity was created or last updated locally.
     */
    public timestamp: Date;

    /**
     * _id "getter" and "setter" for backwards compatibility with the default broker API.
     */
    public get _id(): string {
        return this.id;
    }
    public set _id(id: string) {
        this.id = id;
    }

    /**
     * Private raw data received from the broker.
     */
    private _raw: any;

    /**
     * Protected "getter" and "setter" for the raw data received from the broker.
     * @todo This is currently disabled/unused. It should be removed in the future.
     */
    protected get raw(): any {
        return this._raw;
    }
    protected set raw(raw: any) {
        this.update(raw);
    }

    /**
     * Constructor that creates a new base entity from a plain object received from the broker.
     * @param entity - The plain object received from the broker.
     */
    constructor(entity: any = {}) {
        this.update(entity);
    }

    /**
     * A method that replaces/updates the information of the object with that of a plain object received from the broker.
     * @param entity - The plain object received from the broker.
     */
    public update(entity: any) : void {
        this.id = entity._id;
        this.brokerName = entity.brokerName;
        this.createdAt = new Date(entity.createdAt);
        this.updatedAt = new Date(entity.updatedAt);
        this.timestamp = new Date();
        //this._raw = entity;
    }

    /**
     * A method that compares the current object with another object to determine if their values are equivalent.
     * @param entity - The object to compare to.
     * @todo - Add specific equals implementations to all child classes**
     */
    public equals(entity: any): boolean {
        return !isNil(entity) && (this.id === entity.id || this.id === entity._id)
    }
}

export default BaseEntity;