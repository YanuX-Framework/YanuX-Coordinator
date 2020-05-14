import { isEqual } from 'lodash';
import BaseEntity from "./BaseEntity";

export default class Proxemics extends BaseEntity {
    public id: string;
    public userId: string;
    public sharedWithIds: string[];
    public prevSharedWithIds: string[];
    //TODO: The proxemics state should probably be more formally described and structured so that I can create a type for it.
    public state: { [deviceUuid: string]: any };

    constructor(proxemics: any = {}) {
        super(proxemics);
        this.update(proxemics);
    }

    public update(proxemics: any): void {
        super.update(proxemics);
        this.userId = proxemics.user && proxemics.user._id ? proxemics.user._id : proxemics.user;
        this.sharedWithIds = proxemics.sharedWith ? proxemics.sharedWith.map((u: any) => u._id ? u._id : u) : [];
        this.prevSharedWithIds = proxemics.prevSharedWithIds ? proxemics.prevSharedWithIds.map((u: any) => u._id ? u._id : u) : [];
        this.state = proxemics.state;
    }

    public equals(proxemics: any): boolean {
        return super.equals(proxemics)
            && this.userId === (proxemics.userId || (proxemics.user && proxemics.user._id ? proxemics.user._id : proxemics.user))
            && (isEqual(this.sharedWithIds, proxemics.sharedWith) || isEqual(this.sharedWithIds, proxemics.sharedWithIds))
            && (isEqual(this.prevSharedWithIds, proxemics.prevSharedWith) || isEqual(this.prevSharedWithIds, proxemics.prevSharedWithIds))
            && isEqual(this.state, proxemics.state)
    }
}