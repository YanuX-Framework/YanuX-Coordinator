/**
 * A class that represents the distribution of UI components of a given application instance.
 */
export class ComponentsDistribution {
    /**
     * Whether the distribution was determined automatically (true) or not (false).
     */
    public auto: boolean;
    /**
     * An object representing the distribution of components where the keys represent the name of the components and the boolean values represent whether the components 
     * is shown (true) or not (false).
     */
    public components: { [component: string]: boolean };
    /**
     * Constructor that creates an object from another object that has the same structure as this {@link ComponentsDistribution} class.
     * @param componentsDistribution - The object to be converted or copied.
     */
    constructor(componentsDistribution: any = {}) {
        this.auto = componentsDistribution.auto;
        this.components = componentsDistribution.components;
    }
} 

export default ComponentsDistribution;