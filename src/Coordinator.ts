export default interface Coordinator {
    getState(): any;
    setState(state: any): void;
}