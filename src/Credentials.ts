//TODO: Flesh-out this class with other important user properties.
export default class Credentials {
    private _type : string;
    private _values: Array<string>;
    constructor(type : string, values: Array<string>) {
        this._type = type;
        this.values = values;
    }
    public get type(): string {
        return this._type;
    }
    public set type(type: string) {
        this._type = type;
    }
    public get values(): Array<string> {
        return this._values;
    }
    public set values(credentials: Array<string>) {
        this._values = credentials;
    }
}