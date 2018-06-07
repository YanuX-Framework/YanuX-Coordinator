import App from "./App";
import User from "./User";
export default class Resource {
    id: string;
    app: App;
    user: User;
    data: any;
    createdAt: Date;
    updatedAt: Date;
    private lastResourceChange;
    constructor(app: App, user: User, resource?: any);
    update(resource: any): void;
}
