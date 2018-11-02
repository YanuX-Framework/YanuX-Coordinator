import Coordinator from "./Coordinator";

export default abstract class AbstractCoordinator implements Coordinator {
    public abstract getData(): Promise<any>
    public abstract setData(data: any): Promise<any>
}