/**
 * These objects are used by the {@link ComponentsDistributionElement} and contain a simplified view of the data stored by the system.
 * Just enough to display and receive information from the UI provided by the custom element (Web Component).
 */

/**
 * A class with the basic information about a device.
 */
export class DeviceInfo {
    /**
     * The device UUID.
     */
    public uuid: string;
    /**
     * The device name.
     */
    public name: string;
    /**
     * Constructor the receice the device UUID and name.
     * @param uuid - The device UUID.
     * @param name - The device name.
     */
    constructor(uuid: string, name: string) {
        this.uuid = uuid;
        this.name = name;
    }
}

/**
 * A class with the information about whether a UI component should be shown or not.
 */
 export class ComponentsInfo {
    /**
     * The keys of the object represent the name of the components and the boolean values represent whether the components is shown (true) or not (false).
     */
    [component: string]: boolean;
    /**
     * A constructor that receives another object and converts its key->values to an object of this class.
     * @param values 
     */
    constructor(values: any = {}) {
        Object.assign(this, values);
    }
}

/**
 * A class that represents basic information about an instance.
 */
 export class InstanceInfo {
    /**
     * The name of the instance.
     */
    public name: string;
    /**
     * The device that is running the instance.
     */
    public device: DeviceInfo;
    /**
     * Whether the distribution of UI components has been set automatically (true) or not (false).
     */
    public auto: boolean;
    /**
     * The distribution of UI components.
     */
    public components: ComponentsInfo
    /**
     * Constructor that receives each of the property of the class and initializes them.
     * @param name - The name of the instance.
     * @param device - The device that is running the instance.
     * @param auto - Whether the distribution of UI components has been set automatically (true) or not (false).
     * @param components - The distribution of UI components.
     */
    constructor(name: string, device: DeviceInfo, auto: boolean, components: ComponentsInfo) {
        this.name = name;
        this.device = device;
        this.auto = auto;
        this.components = components;
    }
}

/**
 * The class that represents the structure of the {@link ComponentsDistributionElement.componentsDistribution} attribute.
 */
export class InstancesComponentsDistribution {
    /**
     * The keys of the object represent the UUID of the instances that a user has access to and the values point to objects that represent
     * basic information about an instance and the distribution of its UI components.
     */
    [instanceId: string]: InstanceInfo;
    constructor(instances: any[] = []) {
        instances.forEach(i => {
            this[i._id] = new InstanceInfo(
                i.name,
                i.device ? new DeviceInfo(i.device.deviceUuid, i.device.name) : null,
                i.componentsDistribution ? i.componentsDistribution.auto : true,
                i.componentsDistribution ? new ComponentsInfo(i.componentsDistribution.components) : null
            )
        });
    }
}

export default InstancesComponentsDistribution;