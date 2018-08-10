declare module 'node-localstorage' {
    var LocalStorage: {
        new(location: string): Storage;
        new(location: string, quota: number): Storage;
    };
}