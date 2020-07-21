import {
    isUndefined,
    isNull,
    isString,
    isArray,
    isObjectLike,
    flatten,
    flattenDeep
} from 'lodash';

import RuleEngine from 'node-rules';

export default class ComponentsRuleEngine {
    private _localInstanceUuid: string;
    private _localDeviceUuid: string;
    private _instances: Array<any>;
    private _proxemics: any;
    private _restrictions: any;
    private _R: any;

    constructor(localInstanceUuid: string, localDeviceUuid: string, restrictions: any = {}, proxemics: any = {}, instances: Array<any> = []) {
        this.localInstanceUuid = localInstanceUuid
        this.localDeviceUuid = localDeviceUuid;
        this.restrictions = restrictions;
        this.proxemics = proxemics;
        this.instances = instances;
        this.initRuleEngine();
    }

    public get localInstanceUuid(): string {
        return this._localInstanceUuid;
    }
    public set localInstanceUuid(instanceUuid: string) {
        this._localInstanceUuid = instanceUuid;
    }

    public get localDeviceUuid(): string {
        return this._localDeviceUuid;
    }
    public set localDeviceUuid(localDeviceUuid: string) {
        this._localDeviceUuid = localDeviceUuid;
    }

    public get restrictions(): any {
        return this._restrictions;
    }
    public set restrictions(restrictions: any) {
        this._restrictions = restrictions;
    }

    public get proxemics(): any {
        return this._proxemics;
    }
    public set proxemics(proxemics: any) {
        this._proxemics = proxemics;
    }

    public get instances(): Array<any> {
        return this._instances;
    }
    public set instances(instance: Array<any>) {
        this._instances = instance;
    }

    public get R(): any {
        return this._R;
    }
    public set R(R: any) {
        this._R = R;
    }

    private initRuleEngine(): void {
        this.R = new RuleEngine();

        this.R.register({
            name: 'Create the default components configuration',
            priority: 4,
            condition: function (R: any) {
                R.when(!this.defaultComponentsConfig);
            },
            consequence: function (R: any) {
                this.defaultComponentsConfig = {};
                this.auto = true;
                Object.keys(this.restrictions).forEach(component => {
                    this.defaultComponentsConfig[component] = this.restrictions[component].showByDefault ?
                        this.restrictions[component].showByDefault : false;
                });
                R.next();
            }
        });

        this.R.register({
            name: 'Use the current configuration of the local device\'s instance if there is already a manual component distribition attributed to it',
            priority: 3,
            condition: function (R: any) {
                this.localInstance = this.activeInstances.find((i: any) => i.instanceUuid === this.localInstanceUuid && i.device.deviceUuid === this.localDeviceUuid);
                R.when(!this.ignoreManual
                    && this.localInstance
                    && this.localInstance.componentsDistribution
                    && this.localInstance.componentsDistribution.components
                    && this.localInstance.componentsDistribution.auto === false);
            },
            consequence: function (R: any) {
                this.componentsConfig = this.localInstance.componentsDistribution.components;
                this.auto = false;
                R.stop();
            }
        });

        this.R.register({
            name: 'Start with the default components configuration',
            priority: 2,
            condition: function (R: any) {
                R.when(this.defaultComponentsConfig && !this.componentsConfig);
            },
            consequence: function (R: any) {
                this.componentsConfig = this.defaultComponentsConfig;
                R.next();
            }
        });

        this.R.register({
            name: 'Use the default configuration if the local device is not present or if its instance is not active.',
            //or if its instance is the only one active',
            priority: 1,
            condition: function (R: any) {
                R.when(!this.proxemics[this.localDeviceUuid] || !this.activeInstances.some((i: any) => i.device.deviceUuid === this.localDeviceUuid))
                //|| this.activeInstances.every((i: any) => i.device.deviceUuid === this.localDeviceUuid));
            },
            consequence: function (R: any) {
                this.componentsConfig = this.defaultComponentsConfig;
                R.stop();
            }
        });

        this.R.register({
            name: 'When the local device is present build the capabilities object from the available information, filling any information gaps that may exist in the best way possible',
            priority: 0,
            condition: function (R: any) {
                R.when(this.proxemics[this.localDeviceUuid] && !this.localDeviceCapabilities);
            },
            consequence: function (R: any) {
                this.capabilities = {};
                const expandCapabilities = (([deviceUuid, capabilities]: [string, any]): Array<any> => {
                    const expandCapability = (capability: any): any => {
                        if (!capability.orientiation) {
                            capability.orientiation = 'landscape';
                        } else if (capability.pixelDensity && !capability.pixelRatio) {
                            capability.pixelRatio = capability.pixelDensity / 150;
                            capability.pixelRatio = Math.max(1, capability.pixelRatio);
                            expandCapability([deviceUuid, capabilities]);
                        } else if (!capability.pixelDensity && capability.pixelRatio) {
                            capability.pixelDensity = capability.pixelRatio === 1 ? 96 : capability.pixelRatio * 150;
                            expandCapability([deviceUuid, capabilities]);
                        } else if (!capability.pixelDensity && !capability.pixelRatio &&
                            capability.resolution && capability.size) {
                            const diagonalResolution = Math.sqrt(Math.pow(capability.resolution[0], 2) + Math.pow(capability.resolution[1], 2))
                            const diagonalSize = Math.sqrt(Math.pow(capability.size[0], 2) + Math.pow(capability.size[1], 2))
                            capability.pixelDensity = diagonalResolution / (diagonalSize / 25.4);
                            expandCapability([deviceUuid, capabilities]);
                        } else if (capability.pixelDensity && capability.resolution && !capability.size) {
                            const diagonalResolution = Math.sqrt(Math.pow(capability.resolution[0], 2) + Math.pow(capability.resolution[1], 2))
                            const diagonalSize = diagonalResolution / capability.pixelDensity;
                            const aspectRatio = capability.resolution[0] / capability.resolution[1];
                            const height = (diagonalSize * 25.4) / Math.sqrt(Math.pow(aspectRatio, 2) + 1);
                            const width = aspectRatio * height;
                            capability.size = [width, height];
                            expandCapability([deviceUuid, capabilities]);
                        } else if (capability.resolution && capability.pixelRatio && !capability.virtualResolution) {
                            capability.virtualResolution = [];
                            capability.resolution.forEach((d: number, i: number): any =>
                                capability.virtualResolution[i] = d / capability.pixelRatio);
                            expandCapability([deviceUuid, capabilities]);
                        }
                        return capability;
                    }
                    this.capabilities[deviceUuid] = capabilities
                    Object.entries(([type, capability]: [string, any]) => {
                        this.capabilities[deviceUuid][type] = flatten([capability]).map(expandCapability)
                    });
                    return this.capabilities;
                });
                Object.entries(this.proxemics)
                    //Maybe it's not always necessary to have this check,
                    //but I'm just making sure that ignore the proxemics of devices with non-active instances.
                    .filter(([deviceUuid, capabilities]: [string, any]) =>
                        this.activeInstances.some((i: any) => i.device.deviceUuid === deviceUuid)
                    ).forEach(expandCapabilities);
                this.localDeviceCapabilities = this.capabilities[this.localDeviceUuid];
                R.next();
            }
        });

        this.R.register({
            name: 'when device capabilities are available',
            condition: function (R: any) {
                R.when(this.localDeviceCapabilities && this.capabilities);
            },
            priority: 0,
            consequence: function (R: any) {
                const matchComponents = (component: string, componentRestrictions: any, deviceCapabilities: any, strictMatching: boolean = true): boolean => {
                    const fallbackCheck = (enforce: boolean = true): boolean => {
                        let fallback = false;
                        if (strictMatching) {
                            //If the local device is the only present just fallback by default.
                            if(Object.keys(this.capabilities).every(d => d === this.localDeviceUuid)) {
                                return true;
                            } else if (enforce === false) {
                                fallback = !Object.keys(this.capabilities).filter(d => d !== this.localDeviceUuid).some((d: any) => {
                                    if (this.activeInstances.find((i: any) => i.device.deviceUuid === d)) {
                                        return matchComponents(component, componentRestrictions, this.capabilities[d], false);
                                    } else { return false; }
                                });
                                console.log('>>>>>> Not enforcing condition! Fallback: ', fallback);
                            } 
                        }
                        return fallback;
                    };
                    //TODO: Add support for interval matching. For instance, I want a device with a screen size between a and b.
                    const matchCondition = (condition: any, capability: any): boolean => {
                        const matchConditionAux = (condition: any, operator: string = 'AND', enforce: boolean = true): any => {
                            if (isArray(condition)) {
                                console.log('>>> Condition Array:', condition, 'Capability:', capability, 'Operator:', operator);
                                const checkEachCondition = (c: any): boolean => matchConditionAux(c, operator);
                                const fallback = fallbackCheck(enforce);
                                switch (operator) {
                                    case 'OR': return fallback || condition.some(checkEachCondition);
                                    case 'NOT': return fallback || !condition.every(checkEachCondition);
                                    case 'AND':
                                    default: return fallback || condition.every(checkEachCondition);
                                }
                            }
                            if (!isUndefined(condition.values) || !isUndefined(condition.value)) {
                                if (isUndefined(condition.operator)) {
                                    condition.operator = 'AND';
                                }
                                if (isString(condition.operator)) {
                                    console.log('>>> Condition - Values Array & Operator:', condition, 'Capability:', capability, 'Operator:', operator);
                                    return matchConditionAux(flatten([condition.values || condition.value]), condition.operator, condition.enforce);
                                }
                            }
                            if (isObjectLike(condition) && isString(operator)) {
                                console.log('>>> Condition - Object Operator:', condition, 'Capability:', capability, 'Operator:', operator);
                                const processConditionEntries = ([entryKey, entryValue]: [string, any]): boolean => {
                                    const capabilityValue = flattenDeep([capability[entryKey]]);
                                    const conditionValue = flattenDeep([entryValue.value]);
                                    const fallback = fallbackCheck(entryValue.enforce)
                                    console.log('>>>>', entryValue.operator, ':');
                                    switch (entryValue.operator) {
                                        case '=':
                                            return fallback || conditionValue.every((cn: any, i: number): boolean => capabilityValue[i] == cn);
                                        case '!':
                                            return fallback || conditionValue
                                                .every((cn: any, i: number): boolean => capabilityValue[i] != cn);
                                        case '>':
                                            return fallback || conditionValue
                                                .every((cn: any, i: number): boolean => capabilityValue[i] > cn);
                                        case '>=':
                                            return fallback || conditionValue
                                                .every((cn: any, i: number): boolean => capabilityValue[i] >= cn);
                                        case '<':
                                            return fallback || conditionValue
                                                .every((cn: any, i: number): boolean => capabilityValue[i] < cn);
                                        case '<=':
                                            return fallback || conditionValue
                                                .every((cn: any, i: number): boolean => capabilityValue[i] <= cn);
                                        case 'OR':
                                            return fallback || flatten([entryValue.values]).
                                                some((v: any): boolean => matchConditionAux({ [entryKey]: v }));
                                        case 'AND':
                                            return fallback || flatten([entryValue.values])
                                                .every((v: any): boolean => matchConditionAux({ [entryKey]: v }));
                                        case 'NOT':
                                            return fallback || flatten([entryValue.values])
                                                .every((v: any): boolean => !matchConditionAux({ [entryKey]: v }));
                                        default:
                                            return fallback || entryValue.every((v: any): boolean => matchConditionAux({ [entryKey]: v }));
                                    }
                                }
                                switch (operator) {
                                    case 'OR': return Object.entries(condition).some(processConditionEntries);
                                    case 'AND':
                                    case 'NOT':
                                    default: return Object.entries(condition).every(processConditionEntries);
                                }
                            }
                            if (isArray(capability)) {
                                console.log('>>> Condition - Match Capability Array:', condition, 'Capability:', capability, 'Operator:', operator);
                                return capability.includes(condition);
                            }
                            if (condition == capability || (condition === true && (!isUndefined(capability) || !isNull(capability)))) {
                                return true;
                            } else { return false; }
                        }
                        return matchConditionAux(condition);
                    }
                    console.log('> Component:', component);
                    return Object.entries(componentRestrictions).every(([type, condition]: [string, any]): boolean => {
                        console.log('>> Restrictions:', type);
                        const capability = deviceCapabilities[type];
                        if (isArray(capability) && capability.some(c => !isString(c))) {
                            return capability.some(c => matchCondition(condition, c));
                        }
                        return matchCondition(condition, capability);
                    });
                }
                Object.entries(this.restrictions).forEach(([component, componentRestrictions]) => {
                    this.componentsConfig[component] = matchComponents(component, componentRestrictions, this.localDeviceCapabilities);
                });
                R.stop();
            }
        });
    }

    public run(ignoreManual: boolean = false): Promise<any> {
        const facts = {
            localInstanceUuid: this.localInstanceUuid,
            localDeviceUuid: this.localDeviceUuid,
            ignoreManual,
            activeInstances: this.instances.filter(i => i.active),
            proxemics: this.proxemics,
            restrictions: this.restrictions,
        };
        return new Promise((resolve, reject) => {
            this.R.execute(facts, function (data: any) { resolve(data); });
        });
    }
}