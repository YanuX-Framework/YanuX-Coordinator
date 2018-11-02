export default class Proxemics {
    public id: string;
    public user: any;
    public createdAt: Date;
    public updatedAt: Date;
    private state: any;

    constructor(proxemics: any = {}) {
        this.update(proxemics);
    }
    
    public update(proxemics: any): void {
        this.id = proxemics._id;
        this.state = proxemics.state;
        this.createdAt = new Date(proxemics.createdAt);
        this.updatedAt = new Date(proxemics.updatedAt);
    }
}