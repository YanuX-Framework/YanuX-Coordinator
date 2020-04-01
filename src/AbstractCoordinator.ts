import Coordinator from "./Coordinator";
import SharedResource from "./SharedResource";

export default abstract class AbstractCoordinator implements Coordinator {
    public abstract getResources(): Promise<Array<SharedResource>>;
    public abstract createResource(resourceName: string): Promise<SharedResource>;
    public abstract deleteResource(id: string): Promise<SharedResource>;
    public abstract shareResource(resourceId: string, userEmail: string): Promise<SharedResource>;
    public abstract unshareResource(resourceId: string, userEmail: string): Promise<SharedResource>;
    public abstract getResourceData(id: string): Promise<any>;
    public abstract setResourceData(data: any, id: string): Promise<any>;
    public abstract getProxemicsState(): Promise<any>;
    public abstract getProxemicsState(state: any): Promise<any>;
    public abstract getInstances(extraConditions: any): Promise<any>;
    public abstract getActiveInstances(): Promise<any>;
    public abstract setInstanceActiveness(active: Boolean): Promise<any>;
    public abstract updateInstanceActiveness(): Promise<any>;
    public abstract setComponentDistribution(components: any, auto: Boolean, instanceId: string): Promise<any>;
    public abstract emitEvent(value: any, name: string): Promise<any>;
    public abstract subscribeResources(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract unsubscribeResources(): void;
    public abstract subscribeResource(subscriberFunction: (data: any, eventType: string) => void, id: string): void;
    public abstract unsubscribeResource(): void;
    public abstract subscribeProxemics(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract unsubscribeProxemics(): void;
    public abstract subscribeInstances(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract unsubscribeInstances(): void;
    public abstract subscribeEvents(subscriberFunction: (data: any, eventType: string) => void): void;
    public abstract unsubscribeEvents(): void;
    public abstract subscribeReconnects(subscriberFunction: (state: any, proxemics: any) => void): void;
    public abstract unsubscribeReconnects(): void;
}