export default class DefaultResource {
    public id: string;
    public data: any;
    public createdAt: Date;
    public updatedAt: Date;
    private _raw: any;
    public get raw(): any {
        return this._raw;
    }
    public set raw(raw: any) {
        this._raw = raw;
        this.update(this.raw);
    }

    constructor(resource: any = {}) {
        this.update(resource);
    }

    public update(resource: any): void {
        this.id = resource._id;
        this.data = resource.data;
        this.createdAt = new Date(resource.createdAt);
        this.updatedAt = new Date(resource.updatedAt);
        this._raw = resource;
    }
}