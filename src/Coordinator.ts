import SharedResource from "./SharedResource";

export default interface Coordinator {
    getResourceData(id: string): Promise<any>;
    setResourceData(data: any, id: string): Promise<any>;
    getResources(): Promise<Array<SharedResource>>;
    createResource(resourceName: string): Promise<SharedResource>;
    deleteResource(id: string): Promise<SharedResource>;
    shareResource(resourceId: string, userEmail: string): Promise<SharedResource>;
    unshareResource(resourceId: string, userEmail: string): Promise<SharedResource>;
    getProxemicsState(): Promise<any>;
    getProxemicsState(state: any): Promise<any>;
    getInstances(extraConditions: any): Promise<any>;
    getActiveInstances(): Promise<any>;
    setInstanceActiveness(active: Boolean): Promise<any>;
    updateInstanceActiveness(): Promise<any>;
    setComponentDistribution(components: any, auto: Boolean, instanceId: string): Promise<any>;
    emitEvent(value: any, name: string): Promise<any>;
    subscribeResource(subscriberFunction: (data: any, eventType: string, ) => void, id: string): void;
    unsubscribeResource(): void;
    subscribeResources(subscriberFunction: (data: any, eventType: string) => void): void;
    unsubscribeResources(): void;
    subscribeResourceSubscription(subscriberFunction: (data: any, eventType: string) => void): void;
    unsubscribeResourceSubscription(): void;
    subscribeProxemics(subscriberFunction: (data: any, eventType: string) => void): void;
    unsubscribeProxemics(): void;
    subscribeInstances(subscriberFunction: (data: any, eventType: string) => void): void;
    unsubscribeInstances(): void;
    subscribeEvents(subscriberFunction: (data: any, eventType: string) => void): void;
    unsubscribeEvents(): void;
    subscribeReconnects(subscriberFunction: (state: any, proxemics: any) => void): void;
    unsubscribeReconnects(): void;
}