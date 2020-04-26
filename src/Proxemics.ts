import BaseEntity from "./BaseEntity";

export default class Proxemics extends BaseEntity {
    public id: string;
    //TODO: The proxemics state should probably be more formally described and structured so that I can create a type for it.
    public state: any;

    constructor(proxemics: any = {}) {
        super(proxemics);
    }

    public update(proxemics: any): void {
        super.update(proxemics);
        this.state = proxemics.state;
    }
}