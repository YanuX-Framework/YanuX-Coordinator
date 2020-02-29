export default class ComponentsDistribution {
    public auto : boolean;
    public components : any;
    constructor(componentsDistribution : any = {}) {
        this.auto = componentsDistribution.auto;
        this.components = componentsDistribution.components;
    }
} 