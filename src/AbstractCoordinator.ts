import * as Promise from 'bluebird';
import Coordinator from "./Coordinator";

export default abstract class AbstractCoordinator implements Coordinator {
    private _resource: any;

    public get resource() {
        return this.getResource();
    }

    public set resource(resource: any) {
        this.setResource(resource);
    }

    public getResource(): Promise<any> {
        return Promise.resolve(this._resource);
    }
    public setResource(data: any): void {
        this._resource = data;
    }
}