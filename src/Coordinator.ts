import { SimpleCoordinator, SimpleCoordinatorConstructor} from './SimpleCoordinator';

import SharedResource from "./SharedResource";
import Instance from './Instance';
import Credentials from './Credentials';
import ComponentsDistributionElement from './ComponentsDistributionElement';
import ComponentsRuleEngine from './ComponentsRuleEngine';
import ComponentsDistribution from './ComponentsDistribution';
import ResourceManagementElement from './ResourceManagementElement';


/**
 * The basic interface of a {@link Coordinator} constructor.
 */
export interface CoordinatorConstructor extends SimpleCoordinatorConstructor {
    /**
     * A basic constructor and parameters required to connect to the YanuX Broker.
     * @param brokerUrl - The URL of the broker that the {@link FeathersCoordinator} should connect to.
     * @param localDeviceUrl - The URL of that exposes information about the local device (e.g., the Device UUID).
     * @param clientId - The Client Id used that identifies the application using this {@link FeathersCoordinator} instance 
     * @param credentials - The authentication credentials used to identify the user and that authorize the access to their data.
     */
    new(brokerUrl: string, localDeviceUrl: string, clientId: string, credentials: Credentials): Coordinator;
}

/**
 * Coordinator interface that is exposed as an API to be used by third-party developers.
 */
export interface Coordinator extends SimpleCoordinator{
    /**
     * Gets the updated resources from the YanuX Broker that the current user has access to.
     * If a {@link ResourceManagementElement} is passed, it gets updated with the most recent resource information.
     * @param resourceManagementElement 
     * @return An array of {@link SharedResource} instances that represent the currently available resources that the current user has access to.
     */
    updateResources(resourceManagementElement?: ResourceManagementElement) : Promise<SharedResource[]>

    /**
     * Update the distribution of UI components according to our restrictions by using a {@link ComponentsRuleEngine}.
     * A "configureComponents" function should be passed to be called with the newly determined distribution for the current {@link Instance}.
     * If you are using {@link ComponentsDistributionElement} it can be passed so that it gets automatically updated.
     * 
     * 
     * @param componentsRuleEngine - The {@link ComponentsRuleEngine} instance to be used to redistribute the UI components.
     * @param configureComponents - Function should be passed to be called with the newly determined distribution for the current {@link Instance}.
     * @param componentsDistributionElement - A {@link ComponentsDistributionElement} that can get automatically updated with the changes.
     * @param instanceId - If not passed the Id of the {@link Coordinator.instance} will automatically be used.
     * @param ignoreManual - A boolean flag that instructs the {@link ComponentsRuleEngine} to ignore the manual distribution set by the user. It is "false" by default.
     * @return A Promise that once resolved contains the updated {@link Instance}.
     */
    updateComponentsDistribution(
        componentsRuleEngine: ComponentsRuleEngine,
        configureComponents: (cd: ComponentsDistribution) => void,
        componentsDistributionElement?: ComponentsDistributionElement,
        instanceId?: string,
        ignoreManual?: boolean): Promise<Instance>
}

export default Coordinator;