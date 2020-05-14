import BaseEntity from './BaseEntity'

export default class Client extends BaseEntity{
    public clientId: string;

    constructor(clientId: string, client: any = {}) {
        super(client);
        this.clientId = clientId;
    }

    update(client: any): any {
        super.update(client);
        this.clientId = client.id;
    }
}