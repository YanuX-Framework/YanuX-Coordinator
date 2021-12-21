
import { Coordinator, CoordinatorConstructor } from './Coordinator';
import { SimpleFeathersCoordinator } from './SimpleFeathersCoordinator'

import Credentials from './Credentials';
import Instance from './Instance';
import SharedResource from './SharedResource';
import ComponentsDistribution from './ComponentsDistribution';

import ComponentsRuleEngine from './ComponentsRuleEngine';
import InstancesComponentsDistribution from './InstancesComponentsDistribution';
import ComponentsDistributionElement from './ComponentsDistributionElement';
import ResourceManagementElement from './ResourceManagementElement';

/**
 * Concrete implementation of the {@link Coordinator} interface that connects to the YanuX Broker using the Feathers Socket.io Client.
 */
class FeathersCoordinator extends SimpleFeathersCoordinator implements Coordinator {
    /**
     * Constructor that creates a ready to use {@link FeathersCoordinator} instance.
     * @param brokerUrl - The URL of the broker that the {@link FeathersCoordinator} should connect to.
     * @param localDeviceUrl - The URL of that exposes information about the local device (e.g., the Device UUID).
     * @param clientId - The Client Id used that identifies the application using this {@link FeathersCoordinator} instance 
     * @param credentials - The authentication credentials used to identify the user and that authorize the access to their data.
     * @param onAuthenticated - A function that receives the name of the event and that is called when the connection to the broker is authenticated.
     * A function that simply logs the event is provided by default.
     * @param onLogout - A function that receives the name of the event and that is called when the user logs out from the broker.
     * A function that simply logs the event is provided by default.
     * @param onReAuthenticationError - A function that receives the name of the event and that is called when there is an erro reauthenticating the user.
     * A function that simply logs the event is provided by default.
     * @param storage - The local storage implementation to use.
     */
    constructor(
        brokerUrl: string,
        localDeviceUrl: string = 'http://localhost:3003',
        clientId: string = 'default',
        credentials: Credentials = null,
        storage: Storage = null,
        onAuthenticated: (event: any) => void = SimpleFeathersCoordinator.GENERIC_EVENT_CALLBACK('authenticated'),
        onLogout: (event: any) => void = SimpleFeathersCoordinator.GENERIC_EVENT_CALLBACK('logout'),
        onReAuthenticationError: (event: any) => void = SimpleFeathersCoordinator.GENERIC_EVENT_CALLBACK('reauthentication-error')) {
        super(brokerUrl, localDeviceUrl, clientId, credentials, storage, onAuthenticated, onLogout, onReAuthenticationError);
    }

    public async updateResources(resourceManagementElement: ResourceManagementElement = null): Promise<SharedResource[]> {
        try {
            const resources = await this.getResources();
            console.log('[YXC] Updating Resources:', resources);
            if (resourceManagementElement) {
                resourceManagementElement.userId = this.user.id;
                resourceManagementElement.resources = resources;
                resourceManagementElement.selectedResourceId = this.subscribedResourceId;
            }
            return resources;
        } catch (e) { console.error('[YXC] Error Updating Resources:', e); }

    }

    public async updateComponentsDistribution(
        componentsRuleEngine: ComponentsRuleEngine,
        configureComponents: (cd: ComponentsDistribution) => void,
        componentsDistributionElement: ComponentsDistributionElement = null,
        instanceId = this.instance.id,
        ignoreManual = false): Promise<Instance> {
        console.log('[YXC] Update Components Distribution -- ignoreManual:', ignoreManual)
        try {
            const activeInstances = await this.getActiveInstances();
            componentsRuleEngine.instances = activeInstances;
            componentsRuleEngine.proxemics = this.proxemics.state;

            const result = await componentsRuleEngine.run(ignoreManual);
            const instance = await this.setComponentDistribution(
                instanceId === this.instance.id ? result.componentsConfig : {}, result.auto, instanceId)
            console.log('[YXC] Updated Components Distribution Result:', result, 'Instance:', instance);

            if (instanceId === this.instance.id) {
                configureComponents(instance.componentsDistribution);
            }

            if (componentsDistributionElement) {
                componentsDistributionElement.instanceId = instanceId;
                componentsDistributionElement.componentsDistribution = new InstancesComponentsDistribution(await this.getActiveInstances());
            }

            return instance;
        } catch (e) { console.error('[YXC] Error Updating Components Distribution:', e) }
    }
}

/**
 * Enforcing that the {@link CoordinatorConstructor} is being used by {@link FeathersCoordinator}.
 */
const FeathersCoordinatorClassExpression: CoordinatorConstructor = FeathersCoordinator;
export { FeathersCoordinator, FeathersCoordinatorClassExpression }
export default FeathersCoordinator;