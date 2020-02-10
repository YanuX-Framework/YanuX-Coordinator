import Coordinator from "./Coordinator";

export default abstract class AbstractCoordinator implements Coordinator {
    public abstract getResourceData(): Promise<any>;
    public abstract setResourceData(data: any): Promise<any>;
    public abstract getProxemicsState(): Promise<any>;
    public abstract getProxemicsState(state: any): Promise<any>;
    public abstract getInstances(extraConditions: any): Promise<any>;
    public abstract getActiveInstances(): Promise<any>;
    public abstract setInstanceActiveness(active: Boolean): Promise<any>;
    public abstract updateInstanceActiveness(): Promise<any>;
    public abstract setComponentDistribution(auto: Boolean, components: any): Promise<any>;
    public abstract emitEvent(value: any, name: string): Promise<any>;
    public abstract subscribeResource(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract subscribeProxemics(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract subscribeInstances(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract subscribeEvents(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract subscribeReconnects(subscriberFunction: (state: any, proxemics: any) => void): void;
}