import * as Promise from 'bluebird';
import AbstractCoordinator from "./AbstractCoordinator";
import App from "./App";
import User from "./User";
export default class FeathersCoordinator extends AbstractCoordinator {
    private resource;
    private socket;
    private client;
    private service;
    private storage;
    constructor(url: string, app: App, user: User, localStorageLocation?: string);
    init(subscriberFunction?: (resource: any, eventType: string) => void): Promise<any>;
    private getResource;
    getData(): Promise<any>;
    setData(data: any): Promise<any>;
    subscribe(subscriberFunction: (data: any, eventType: string) => void): void;
}
