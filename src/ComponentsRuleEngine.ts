import * as _ from "lodash";
import * as RuleEngine from 'node-rules';

export default class ComponentsRuleEngine {
    private _localDeviceUuid: string;
    private _instances: Array<any>;
    private _proxemics: any;
    private _restrictions: any;

    constructor(localDeviceUuid: string, instances: Array<any>, proxemics: any, restrictions: any) {
        this.localDeviceUuid = localDeviceUuid;
        this.instances = instances;
        this.proxemics = proxemics;
        this.restrictions = restrictions;
    }

    get localDeviceUuid(): string {
        return this._localDeviceUuid;
    }
    set localDeviceUuid(localDeviceUuid: string) {
        this._localDeviceUuid = localDeviceUuid;
    }

    get instances(): Array<any> {
        return this._instances;
    }
    set instances(instance: Array<any>) {
        this._instances = instance;
    }

    get proxemics(): any {
        return this._proxemics;
    }
    set proxemics(proxemics: any) {
        this._proxemics = proxemics;
    }

    get restrictions(): any {
        return this._restrictions;
    }
    set restrictions(restrictions: any) {
        this._restrictions = restrictions;
    }

    public run(): Promise<any> {
        const R = new RuleEngine();
        const facts = {
            localDeviceUuid: this.localDeviceUuid,
            activeInstances: this.instances.filter(i => i.active),
            proxemics: this.proxemics,
            restrictions: this.restrictions,
        };

        R.register({
            name: 'Create the default components configuration which hides all components by default',
            priority: 3,
            condition: function (R: any) {
                R.when(!this.defaultComponentsConfig);
            },
            consequence: function (R: any) {
                this.defaultComponentsConfig = {};
                Object.keys(this.restrictions).forEach(component => {
                    this.defaultComponentsConfig[component] = false;
                });
                R.next();
            }
        });

        R.register({
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

        R.register({
            name: 'Use the default configuration when the local device is not present or its instance is not active',
            priority: 1,
            condition: function (R: any) {
                R.when(!this.proxemics[this.localDeviceUuid]);
            },
            consequence: function (R: any) {
                this.componentsConfig = this.defaultComponentsConfig;
                R.stop();
            }
        });

        R.register({
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
                        this.capabilities[deviceUuid][type] = _.flatten([capability]).map(expandCapability)
                    });
                    return this.capabilities;
                });
                Object.entries(this.proxemics).forEach(expandCapabilities);
                this.localDeviceCapabilities = this.capabilities[this.localDeviceUuid];
                R.next();
            }
        });

        R.register({
            name: 'when device capabilities are available',
            condition: function (R: any) {
                R.when(this.localDeviceCapabilities && this.capabilities);
            },
            priority: 0,
            consequence: function (R: any) {
                const matchComponents = (component: string, componentRestrictions: any, deviceCapabilities: any, strictMatching: boolean = true): boolean => {
                    const fallbackCheck = (enforce: boolean = true): boolean => {
                        let fallback = false;
                        if (enforce === false && strictMatching) {
                            fallback = !Object.keys(this.capabilities).filter(d => d !== this.localDeviceUuid).some((d: any) => {
                                if (this.activeInstances.find((i: any) => i.device.deviceUuid === d)) {
                                    return matchComponents(component, componentRestrictions, this.capabilities[d], false);
                                } else {
                                    return false;
                                }
                            });
                            console.log('>>>>>> Not enforcing condition! Fallback: ', fallback);
                        }
                        return fallback;
                    };
                    const matchCondition = (condition: any, capability: any): boolean => {
                        const matchConditionAux = (condition: any, operator: string = 'AND', enforce: boolean = true): any => {
                            if (_.isArray(condition)) {
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
                            if (!_.isUndefined(condition.values) || !_.isUndefined(condition.value)) {
                                if (_.isUndefined(condition.operator)) {
                                    condition.operator = 'AND';
                                }
                                if (_.isString(condition.operator)) {
                                    console.log('>>> Condition - Values Array & Operator:', condition, 'Capability:', capability, 'Operator:', operator);
                                    return matchConditionAux(_.flatten([condition.values || condition.value]), condition.operator, condition.enforce);
                                }
                            }
                            if (_.isObjectLike(condition) && _.isString(operator)) {
                                console.log('>>> Condition - Object Operator:', condition, 'Capability:', capability, 'Operator:', operator);
                                const processConditionEntries = ([entryKey, entryValue]: [string, any]): boolean => {
                                    const capabilityValue = _.flattenDeep([capability[entryKey]]);
                                    const conditionValue = _.flattenDeep([entryValue.value]);
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
                                            return fallback || _.flatten([entryValue.values]).
                                                some((v: any): boolean => matchConditionAux({ [entryKey]: v }));
                                        case 'AND':
                                            return fallback || _.flatten([entryValue.values])
                                                .every((v: any): boolean => matchConditionAux({ [entryKey]: v }));
                                        case 'NOT':
                                            return fallback || _.flatten([entryValue.values])
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
                            if (_.isArray(capability)) {
                                console.log('>>> Condition - Match Capability Array:', condition, 'Capability:', capability, 'Operator:', operator);
                                return capability.includes(condition);
                            }
                            if (condition == capability || (condition === true && (!_.isUndefined(capability) || !_.isNull(capability)))) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                        return matchConditionAux(condition);
                    }
                    console.log('> Component:', component);
                    return Object.entries(componentRestrictions).every(([type, condition]: [string, any]): boolean => {
                        console.log('>> Restrictions:', type);
                        const capability = deviceCapabilities[type];
                        if (_.isArray(capability) && capability.some(c => !_.isString(c))) {
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
        return new Promise(function (resolve, reject) {
            R.execute(facts, function (data: any) {
                resolve(data);
            });
        });
    }
}