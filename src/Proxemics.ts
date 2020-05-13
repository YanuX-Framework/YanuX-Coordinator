import BaseEntity from "./BaseEntity";

export default class Proxemics extends BaseEntity {
    public id: string;
    public userId: string;
    public sharedWithIds: string[];
    //TODO: The proxemics state should probably be more formally described and structured so that I can create a type for it.
    public state: any;

    constructor(proxemics: any = {}) {
        super(proxemics);
    }

    public update(proxemics: any): void {
        super.update(proxemics);
        this.userId = proxemics.user && proxemics.user._id ? proxemics.user._id : proxemics.user;
        this.sharedWithIds = proxemics.sharedWith ? proxemics.sharedWith.map((u: any) => u._id ? u._id : u) : [];
        this.state = proxemics.state;
    }
}