import Coordinator from "./Coordinator";

export default abstract class AbstractCoordinator implements Coordinator {
    public abstract getResourceData(): Promise<any>
    public abstract setResourceData(data: any): Promise<any>
    public abstract getProxemicsState(): Promise<any>
    public abstract getProxemicsState(state: any): Promise<any>
}