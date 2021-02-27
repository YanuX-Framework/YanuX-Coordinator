import {
    isUndefined,
    isNull,
    isString,
    isArray,
    isObjectLike,
    flatten,
    flattenDeep,
    omit
} from 'lodash';

import RuleEngine from 'node-rules';

import memoize from 'fast-memoize'

export class ComponentsRuleEngine {
    private _localInstanceUuid: string;
    private _localDeviceUuid: string;
    private _instances: Array<any>;
    private _proxemics: any;
    private _restrictions: any;
    private _currentComponentsDistribution: { [key: string]: boolean }
    private _R: any;

    constructor(localInstanceUuid: string, localDeviceUuid: string, restrictions: any = {}, proxemics: any = {}, instances: Array<any> = []) {
        this.localInstanceUuid = localInstanceUuid
        this.localDeviceUuid = localDeviceUuid;
        this.restrictions = restrictions;
        this.proxemics = proxemics;
        this.instances = instances;
        this.currentComponentsDistribution = {};
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

    public get currentComponentsDistribution(): { [key: string]: boolean } {
        return this._currentComponentsDistribution;
    }
    public set currentComponentsDistribution(currentComponentsDistribution: { [key: string]: boolean }) {
        this._currentComponentsDistribution = currentComponentsDistribution;
    }

    public get R(): any {
        return this._R;
    }
    public set R(R: any) {
        this._R = R;
    }

    private static expandDeviceCapabilities: Function = memoize(ComponentsRuleEngine.__expandDeviceCapabilities, { strategy: memoize.strategies.variadic });
    private static __expandDeviceCapabilities(deviceUuid: string, capabilities: any): Array<any> {
        const expandCapability = (capability: any): any => {
            if (!capability.orientiation) {
                capability.orientiation = 'landscape';
            } else if (capability.pixelDensity && !capability.pixelRatio) {
                capability.pixelRatio = capability.pixelDensity / 150;
                capability.pixelRatio = Math.max(1, capability.pixelRatio);
                return expandCapability(capability);
            } else if (!capability.pixelDensity && capability.pixelRatio) {
                capability.pixelDensity = capability.pixelRatio === 1 ? 96 : capability.pixelRatio * 150;
                return expandCapability(capability);
            } else if (!capability.pixelDensity && !capability.pixelRatio &&
                capability.resolution && capability.size) {
                const diagonalResolution = Math.sqrt(Math.pow(capability.resolution[0], 2) + Math.pow(capability.resolution[1], 2))
                const diagonalSize = Math.sqrt(Math.pow(capability.size[0], 2) + Math.pow(capability.size[1], 2))
                capability.pixelDensity = diagonalResolution / (diagonalSize / 25.4);
                return expandCapability(capability);
            } else if (capability.pixelDensity && capability.resolution && !capability.size) {
                const diagonalResolution = Math.sqrt(Math.pow(capability.resolution[0], 2) + Math.pow(capability.resolution[1], 2))
                const diagonalSize = diagonalResolution / capability.pixelDensity;
                const aspectRatio = capability.resolution[0] / capability.resolution[1];
                const height = (diagonalSize * 25.4) / Math.sqrt(Math.pow(aspectRatio, 2) + 1);
                const width = aspectRatio * height;
                capability.size = [width, height];
                return expandCapability(capability);
            } else if (capability.resolution && capability.pixelRatio && !capability.virtualResolution) {
                capability.virtualResolution = [];
                capability.resolution.forEach((d: number, i: number): any => capability.virtualResolution[i] = d / capability.pixelRatio);
                return expandCapability(capability);
            }
            return capability;
        }
        Object.entries(([type, capability]: [string, any]) => {
            capabilities[deviceUuid][type] = flatten([capability]).map(expandCapability)
        });
        return capabilities;
    };

    private static matchComponentAndRestrictions: Function = memoize(ComponentsRuleEngine.__matchComponentAndRestrictions, { strategy: memoize.strategies.variadic });
    private static __matchComponentAndRestrictions(component: string, componentRestrictions: any, localDeviceUuid: string, localDeviceCapabilities: any, capabilities: any, strictMatching: boolean = true): boolean {
        const fallbackCheck = (enforce: boolean = true): boolean => {
            let fallback = false;
            if (strictMatching) {
                if (enforce === false) {
                    const nonLocalDeviceUuids = Object.keys(capabilities).filter(d => d !== localDeviceUuid);
                    fallback = !nonLocalDeviceUuids.some((d: any) =>
                        ComponentsRuleEngine.matchComponentAndRestrictions(component, componentRestrictions, localDeviceUuid, capabilities[d], capabilities, false)
                    );
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
                        console.log('>>>> Entry Value', entryValue);
                        switch (entryValue.operator) {
                            case '=':
                                return fallback || conditionValue.every((cn: any, i: number): boolean => capabilityValue[i] == cn);
                            case '!':
                                return fallback || conditionValue.every((cn: any, i: number): boolean => capabilityValue[i] != cn);
                            case '>':
                                return fallback || conditionValue.every((cn: any, i: number): boolean => capabilityValue[i] > cn);
                            case '>=':
                                return fallback || conditionValue.every((cn: any, i: number): boolean => capabilityValue[i] >= cn);
                            case '<':
                                return fallback || conditionValue.every((cn: any, i: number): boolean => capabilityValue[i] < cn);
                            case '<=':
                                return fallback || conditionValue.every((cn: any, i: number): boolean => capabilityValue[i] <= cn);
                            case 'OR':
                                return fallback || flatten([entryValue.values]).some((v: any): boolean => matchConditionAux({ [entryKey]: v }));
                            case 'AND':
                                return fallback || flatten([entryValue.values]).every((v: any): boolean => matchConditionAux({ [entryKey]: v }));
                            case 'NOT':
                                return fallback || flatten([entryValue.values]).every((v: any): boolean => !matchConditionAux({ [entryKey]: v }));
                            default:
                                return fallback || isArray(entryValue) ?
                                    entryValue.every((v: any): boolean => matchConditionAux({ [entryKey]: v })) :
                                    matchConditionAux({ [entryKey]: entryValue });
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
                return fallbackCheck(enforce) || condition == capability || (condition === true && (!isUndefined(capability) || !isNull(capability)));
            }
            return matchConditionAux(condition);
        }
        console.log('> Component:', component);
        return Object.entries(componentRestrictions).every(([type, condition]: [string, any]): boolean => {
            console.log('>> Restrictions:', type);
            const capability = localDeviceCapabilities[type];
            if (isArray(capability) && capability.some(c => !isString(c))) {
                return capability.some(c => matchCondition(condition, c));
            }
            return matchCondition(condition, capability);
        });
    }

    private initRuleEngine(): void {
        const self = this;
        this.R = new RuleEngine();
        this.R.register({
            name: 'Create the default components configuration',
            priority: 4,
            condition: function (R: any) { R.when(!this.componentsConfig); },
            consequence: function (R: any) {
                this.componentsConfig = {};
                this.auto = true;
                Object.keys(this.restrictions).forEach(component => {
                    if (this.restrictions[component].showByDefault === true) {
                        this.componentsConfig[component] = true;
                    } else if (this.restrictions[component].showByDefault === false) {
                        this.componentsConfig[component] = false;
                    } else { this.componentsConfig[component] = null; }
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
            name: 'When device local instance is not active.',
            condition: function (R: any) { R.when(!this.localInstance); },
            priority: 2,
            consequence: function (R: any) {
                this.componentsConfig = self.currentComponentsDistribution;
                R.stop();
            }
        });

        this.R.register({
            name: 'When the local device is present build the capabilities object from the available information, filling any information gaps that may exist in the best way possible',
            priority: 1,
            condition: function (R: any) { R.when(this.localInstance && !this.localDeviceCapabilities); },
            consequence: function (R: any) {
                this.capabilities = {};
                Object.entries(this.proxemics)
                    //Making sure to ignore the proxemics of devices with non-active instances.
                    .filter(([deviceUuid]: [string, any]) => this.activeInstances.some((i: any) => i.device.deviceUuid === deviceUuid))
                    .forEach(([deviceUuid, capabilities]: [string, any]) =>
                        this.capabilities[deviceUuid] = ComponentsRuleEngine.expandDeviceCapabilities(deviceUuid, capabilities)
                    );

                if (!this.capabilities[this.localDeviceUuid]) {
                    this.capabilities = {};
                    this.capabilities[this.localDeviceUuid] = ComponentsRuleEngine.expandDeviceCapabilities(this.localDeviceUuid, this.localInstance.device.capabilities);
                }

                this.localDeviceCapabilities = this.capabilities[this.localDeviceUuid];
                R.next();
            }
        });

        this.R.register({
            name: 'When device capabilities are available determine the components configuration.',
            condition: function (R: any) { R.when(this.localDeviceCapabilities && this.capabilities); },
            priority: 0,
            consequence: function (R: any) {
                const isLocalDeviceTheOnlyActiveDevice = this.activeInstances.every((i: any) => i.device.deviceUuid === this.localDeviceUuid);
                Object.entries(this.restrictions).forEach(([component, componentRestrictions]: [string, any]) => {
                    const currentRestrictions = omit(componentRestrictions, ['showByDefault']);
                    if (this.componentsConfig[component] === null || !isLocalDeviceTheOnlyActiveDevice) {
                        this.componentsConfig[component] = ComponentsRuleEngine.matchComponentAndRestrictions(
                            component, currentRestrictions, this.localDeviceUuid, this.localDeviceCapabilities, this.capabilities
                        );
                    }
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
            activeInstances: this.instances.filter(i => i.active === true),
            proxemics: this.proxemics,
            restrictions: this.restrictions,
        };
        const self = this;
        return new Promise(resolve => {
            this.R.execute(facts, function (data: any) {
                self.currentComponentsDistribution = data.componentsConfig;
                resolve(data);
            });
        })
    }
}

export default ComponentsRuleEngine;