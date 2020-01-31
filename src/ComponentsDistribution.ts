export default class ComponentsDistribution {
    public auto : boolean;
    public components : any;
    constructor(compontsDistribution : any = {}) {
        this.auto = compontsDistribution.auto;
        this.components = compontsDistribution.components;
    }
} 