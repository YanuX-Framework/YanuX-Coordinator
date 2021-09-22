/**
 * -----------------------------------------------------------------------------
 * -- TODO ---------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * Add some of the things that I have also planned to add to the YanuX Auth component.
 * See the TODO notes and links that I placed on that project's 'app.js' about the following topics:
 * - Unit Testing
 * - Proper Log Support
 * -----------------------------------------------------------------------------
 */

import { Coordinator, CoordinatorConstructor } from './Coordinator';
import FeathersCoordinator from './FeathersCoordinator';
import Credentials from './Credentials';
import ComponentsRuleEngine from './ComponentsRuleEngine';
import ResourceManagementElement from './ResourceManagementElement';
import ComponentsDistributionElement from './ComponentsDistributionElement';
import { InstancesComponentsDistribution, DeviceInfo, ComponentsInfo, InstanceInfo } from './InstancesComponentsDistribution';
import BaseEntity from './BaseEntity';
import Client from './Client';
import Device from './Device';
import Instance from './Instance';
import Proxemics from './Proxemics';
import Resource from './Resource';
import SharedResource from './SharedResource';
import User from './User';
import ComponentsDistribution from './ComponentsDistribution';
import * as errors from './errors';

export {
    Coordinator, CoordinatorConstructor,
    FeathersCoordinator,
    Credentials,
    ComponentsRuleEngine,
    ResourceManagementElement,
    ComponentsDistributionElement,
    InstancesComponentsDistribution, DeviceInfo, ComponentsInfo, InstanceInfo,
    BaseEntity,
    Client,
    Device,
    Instance,
    Proxemics,
    Resource,
    SharedResource,
    User,
    ComponentsDistribution,
    errors
};