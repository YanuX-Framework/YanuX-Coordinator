class Device {
    public uuid: string;
    public name: string;
    constructor(uuid: string, name: string) {
        this.uuid = uuid;
        this.name = name;
    }
}

class Components {
    [component: string]: boolean;
    constructor(values: any = {}) {
        Object.assign(this, values);
    }
}

class Instance {
    public name: string;
    public device: Device;
    public auto: boolean;
    public components: Components
    constructor(name: string, device: Device, auto: boolean, components: Components) {
        this.name = name;
        this.device = device;
        this.auto = auto;
        this.components = components;
    }
}

export default class InstancesComponentsDistribution {
    [instanceId: string]: Instance;
    constructor(instances: any[] = []) {
        instances.forEach(i => {
            this[i._id] = new Instance(
                i.name,
                i.device ? new Device(i.device.deviceUuid, i.device.name) : null,
                i.componentsDistribution ? i.componentsDistribution.auto : true,
                i.componentsDistribution ? new Components(i.componentsDistribution.components) : null
            )
        });
    }
} 