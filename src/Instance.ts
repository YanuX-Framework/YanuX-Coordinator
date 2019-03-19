export default class Instance {
    public id: string;
    public active: Boolean;
    public instanceUuid: String;
    public createdAt: Date;
    public updatedAt: Date;
    public _raw: any;

    constructor(instance: any = {}) {
        this.update(instance);
    }

    public update(instance: any): void {
        this.id = instance._id;
        this.active = instance.active;
        this.instanceUuid = instance.instanceUuid;
        this.createdAt = new Date(instance.createdAt);
        this.updatedAt = new Date(instance.updatedAt);
        this._raw = instance;
    }
    
    public get raw() : any {
        return this._raw;
    }
    
    public set raw(raw : any) {
        this._raw = raw;
        this.update(this.raw);
    }
}
