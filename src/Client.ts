import BaseEntity from './BaseEntity'

/**
 * A class representing the client application.
 */
export class Client extends BaseEntity{
    /**
     * The Id of the client application.
     */
    public clientId: string;

    /**
     * A constructor that crestes a {@link Client} object from its client Id and a plain client object received from the broker.
     * @param clientId - The client Id
     * @param client - A plain object received from the broker with information about the {@link Client}.
     */
    constructor(clientId: string, client: any = {}) {
        super(client);
        this.clientId = clientId;
    }

    /**
     * It updates the current object with information from a plain object received from the broker.
     * @param client - A plain object received from the broker with information about the {@link Client}. 
     */
    public update(client: any) : void {
        super.update(client);
        this.clientId = client.id;
    }
}

export default Client;