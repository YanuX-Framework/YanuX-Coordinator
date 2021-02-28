/**
 * Class that represents the {@link Credentials} used to connect to the broker.
 */
export class Credentials {
    private _type : string;
    private _values: Array<string>;
    /**
     * Constructor to build a {@link Credentials} object.
     * @param type - The type of credentials (e.g., yanux, local or jwt).
     * @param values - An array of strings with the values of the credentials.
     */
    constructor(type : string, values: Array<string>) {
        this._type = type;
        this.values = values;
    }

    /**
     * "Getter" and "setter" for the type of credentials (e.g., yanux, local or jwt).
     */
    public get type(): string {
        return this._type;
    }
    public set type(type: string) {
        this._type = type;
    }

    /**
     * "Getter" and "setter" for an array of strings with the values of the credentials.
     */
    public get values(): Array<string> {
        return this._values;
    }
    public set values(credentials: Array<string>) {
        this._values = credentials;
    }
}

export default Credentials;