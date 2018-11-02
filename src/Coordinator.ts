export default interface Coordinator {
    getData(): Promise<any>;
    setData(data: any): Promise<any>;
}