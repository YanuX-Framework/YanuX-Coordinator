export default class Proxemics {
    public id: string;
    public createdAt: Date;
    public updatedAt: Date;
    public state: any;
    private _raw: any;
    public get raw(): any {
        return this._raw;
    }
    public set raw(raw: any) {
        this._raw = raw;
        this.update(this.raw);
    }

    constructor(proxemics: any = {}) {
        this.update(proxemics);
    }

    public update(proxemics: any): void {
        this.id = proxemics._id;
        this.state = proxemics.state;
        this.createdAt = new Date(proxemics.createdAt);
        this.updatedAt = new Date(proxemics.updatedAt);
        this._raw = proxemics;
    }
}