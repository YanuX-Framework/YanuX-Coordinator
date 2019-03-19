export default interface Coordinator {
    getResourceData(): Promise<any>;
    setResourceData(data: any): Promise<any>;
    getProxemicsState(): Promise<any>;
    getProxemicsState(state: any): Promise<any>;
}