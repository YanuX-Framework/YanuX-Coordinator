export default class App {
    private _name: string;
    constructor(name: string) {
        this._name = name;
    }
    public get name(): string {
        return this._name;
    }
    public set username(name: string) {
        this._name = name;
    }
}