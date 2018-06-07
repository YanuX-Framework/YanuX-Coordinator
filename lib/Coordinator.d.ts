import * as Promise from 'bluebird';
export default interface Coordinator {
    getData(): Promise<any>;
    setData(data: any): Promise<any>;
}
