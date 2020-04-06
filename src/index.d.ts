declare module 'node-localstorage' {
    var LocalStorage: {
        new(location: string): Storage;
        new(location: string, quota: number): Storage;
    };
}

declare module 'node-rules';

declare module "*.svg" {
    const content: any;
    export default content;
}