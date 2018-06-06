import * as Promise from 'bluebird';

export default interface Coordinator {
    getResource(): Promise<any>;
    setResource(data: any): void;
}