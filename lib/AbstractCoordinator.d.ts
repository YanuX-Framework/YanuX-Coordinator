import * as Promise from 'bluebird';
import Coordinator from "./Coordinator";
export default abstract class AbstractCoordinator implements Coordinator {
    abstract getData(): Promise<any>;
    abstract setData(data: any): Promise<any>;
}
