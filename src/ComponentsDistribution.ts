export class ComponentsDistribution {
    public auto: boolean;
    public components: { [component: string]: boolean };
    constructor(componentsDistribution: any = {}) {
        this.auto = componentsDistribution.auto;
        this.components = componentsDistribution.components;
    }
} 

export default ComponentsDistribution;