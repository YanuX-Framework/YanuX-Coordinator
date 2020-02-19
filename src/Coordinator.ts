export default interface Coordinator {
    getResourceData(): Promise<any>;
    setResourceData(data: any): Promise<any>;
    getProxemicsState(): Promise<any>;
    getProxemicsState(state: any): Promise<any>;
    getInstances(extraConditions: any): Promise<any>;
    getActiveInstances(): Promise<any>;
    setInstanceActiveness(active: Boolean): Promise<any>;
    updateInstanceActiveness(): Promise<any>;
    setComponentDistribution(components: any, auto: Boolean, instanceId: string): Promise<any>;
    emitEvent(value: any, name: string): Promise<any>;
    subscribeResource(subscriberFunction: (data: any, eventType: string) => void): void;
    subscribeProxemics(subscriberFunction: (data: any, eventType: string) => void): void;
    subscribeInstances(subscriberFunction: (data: any, eventType: string) => void): void;
    subscribeEvents(subscriberFunction: (data: any, eventType: string) => void): void;
    subscribeReconnects(subscriberFunction: (state: any, proxemics: any) => void): void;
}