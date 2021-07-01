import User from './User';
import Client from './Client';
import Device from './Device';
import Resource from "./Resource";
import SharedResource from "./SharedResource";
import Proxemics from './Proxemics';
import Instance from './Instance';
import Credentials from './Credentials';
import { ComponentsDistributionElement, ComponentsRuleEngine, ComponentsDistribution } from '.';

/**
 * The basic interface of a {@link Coordinator} constructor.
 */
export interface CoordinatorConstructor {
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
export interface Coordinator {
    /**
     * The Object representing the currenrtly logged in {@link User}. 
     * Details will only be populated once a connection is established and the user is authenticated.
     */
    user: User;

    /**
     * The Object representing the client application that is connecting to the Broker.
     */
    client: Client;

    /**
     * The Object representing the Device where this {@link Coordinator} is being run.
     * Details will only be populated once a connection is established and the user is authenticated.
     */
    device: Device;

    /**
     * The Object representing the default Resource ({@link Resource.default}) of the {@link User} which is currently connected and logged in through the {@link Coordinator}.
     * Assuming that {@link Coordinator.subscribeResources} has been called, this Object will be automatically updated every time that the {@link Coordinator} 
     * has been notified that the default {@link Resource} for the {@link Coordinator.user | User} has changed.
     * It will also be opportunistically updated by {@link Coordinator.getResources} and {@link Coordinator.updateResource},
     * i.e., if any of those methods happen to be dealing with the default resource, they will ensure the {@link Coordinator.resource} gets updated.
     * @deprecated This member, or at least its current behavior, should be deprecated/changed in the future so that {@link Coordinator.resource} always points
     * to the {@link Resource} with the current {@link Coordinator.subscribedResourceId}.
     */
    resource: Resource;

    /**
     * A string with the Id of the currently subscribed {@link Resource} that the {@link Coordinator} is currently subscribed to 
     * (e.g., the {@link Resource} was selected in the User Interface of a client application)
     * This string is set once a connection is established and the user is authenticated. 
     * It will also be updated when a user when {@link Coordinator.subscribeResource} is called.
     */
    readonly subscribedResourceId: string;

    /**
     * The Object representing the current state of the proxemic relationships between the devices found in the surrounding environment and their capabilities.
     * This Object is populated once a connection is established and the user is authenticated. 
     * Assuming that {@link Coordinator.subscribeProxemics} has been called, 
     * this Object will be automatically updated every time that the {@link Coordinator} has been notified
     * that the {@link Proxemics} of the currently logged in {@link Coordinator.user | User} have changed.
     */
    proxemics: Proxemics;

    /**
     * The Object representing the currently running instance of the {@link Coordinator}, together with the client application, on the local device.
     * This Object is populated once a connection is established and the user is authenticated. 
     * Assuming that {@link Coordinator.subscribeInstances} has been called, 
     * this Object will be automatically updated every time that the {@link Coordinator} has been notified that the currently running local {@link Instance} has changed.
     */
    instance: Instance;

    /**
     * It initializes the connection to the broker and returns a promise with useful information.
     * @return A Promise that once resolved contains an array with the data of default resource ({@link Coordinator.resource}), 
     * information about the proxemic state and the Id of the default resource.
     */
    init(): Promise<[any, Proxemics, string]>

    /**
     * Get the data contents of the {@link Resource} with the given Id.
     * @param resourceId - The Id of the {@link Resource} that should have its data content retrieved.
     * If the Id is not provided the Id of the currently selected {@link Resource} will be used by default.
     * @returns A Promise that once resolved contains the data contents of the {@link Resource}. If an error occurs the Promise will be rejected.
     */
    getResourceData(resourceId?: string): Promise<any>;

    /**
     * Set the data contents of the {@link Resource} with the given Id.
     * @param data - The data contents of that should be saved to the {@link Resource}.
     * @param id - The Id of the {@link Resource} that should have its data content replaced with the provided data.
     * If the Id is not provided the Id of the currently selected {@link Resource} will be used by default.
     * @returns A Promise that once resolved contains the data contents of the {@link Resource}. If an error occurs the Promise will be rejected.
     */
    setResourceData(data: any, id?: string): Promise<any>;

    /**
     * Gets all the resources that a user has access to (i.e., owned or shared with) in the form of an array instances of the {@link SharedResource} class.
     * @returns A Promise that once resolved constains the array of {@link SharedResource}s. If an error occurs the Promise will be rejected.
     */
    getResources(): Promise<Array<SharedResource>>;

    /**
     * It implicitly subscribes to the {@link Resource} with the given Id and returns the most up-to-date data stored by the resource.
     * @param subscriberFunction - The function that gets called when a change to the subscribed {@link Resource} is received.
     * The function receives the resource data ({@link Resource.data}) and the type of event (created, updated, patched or removed) that generated the change.
     * @param resourceId - The Id of the {@link Resource} that should be subscribed to and have its data content retrieved.
     */
    selectResource(subscriberFunction: (data: any, eventType: string) => void, resourceId: string): Promise<any>

    /**
     * Creates a new {@link Resource} with the given name that belongs to the current {@link Coordinator.user | User}.
     * @param resourceName The name of the new resource. If a resource name is not provide an empty string will be used.
     * @returns A Promise that once resolved constains the newly created resource in the form an instance of {@link SharedResource} class.
     * If an error occurs the Promise will be rejected.
     */
    createResource(resourceName?: string): Promise<SharedResource>;

    /**
     * Deletes a {@link Resource} with the given Id.
     * @param resourceId - The Id of the {@link Resource} that should be deleted.
     * If no Id is provided the Id of the currently subscribed to resource will be used ({@link Coordinator.subscribedResourceId}).
     * @returns A Promise that once resolved constains the deleted resource in the form an instance of {@link SharedResource} class.
     * If an error occurs the Promise will be rejected.
     */
    deleteResource(resourceId?: string): Promise<SharedResource>;

    /**
     * Shares a {@link Resource} with a given Id with an {@link User} with a certain e-mail address.
     * @param userEmail - The e-mail address of the user with whom the {@link Resource} with the given Id should be shared.
     * @param resourceId - The Id of the {@link Resource} that should be shared with the user with the provided e-mail address. 
     * If no Id is provided the Id of the currently subscribed to resource will be used ({@link Coordinator.subscribedResourceId}).
     * @return - A Promise that once resolved constains the resource that was shared in the form an instance of {@link SharedResource} class.
     * If an error occurs the Promise will be rejected.
     */
    shareResource(userEmail: string, resourceId?: string): Promise<SharedResource>;

    /**
     * Unshares a {@link Resource} with a given Id that was shared with a {@link User} with a certain e-mail address.
     * @param userEmail - The e-mail address of the user with whom the {@link Resource} with the given Id should be unshared.
     * @param resourceId - The Id of the {@link Resource} that should be unshared with the user with the provided e-mail address. 
     * If no Id is provided the Id of the currently subscribed to resource will be used ({@link Coordinator.subscribedResourceId}).
     * @return - A Promise that once resolved constains the resource that was unshared in the form an instance of {@link SharedResource} class. 
     * If an error occurs the Promise will be rejected.
     */
    unshareResource(userEmail: string, resourceId?: string): Promise<SharedResource>;

    /**
     * Gets the Proxemic state (i.e., the {@link Proxemics.state} value) for the current {@link Coordinator.user | User}.
     * The state contains the proxemic information and capabilities of a device, i.e., if a device is present in the environment this object should contain a key
     * with its UUID that points to an object that represents the device capabilities.    
     * @returns A Promise that once resolved constains the Proxemic state (i.e., the {@link Proxemics.state} value) for the current {@link Coordinator.user | User}.
     */
    getProxemicsState(): Promise<{ [deviceUuid: string]: any }>;

    /**
     * Gets all the Instances that the current {@link Coordinator.user | User} has access to (i.e., owned or shared with the user through resource sharing).
     * @param extraConditions - Extra conditions that can be added to the query to further filter the returned instances.
     * @returns A Promise that once resolved contains the instances as they were returned from the broker. 
     * They should however nearly match the structure of the {@link Instance} class. If an error occurs the Promise will be rejected.
     * @todo Change Promise<Array<any>> to Promise<Array<Instance>> by converting the objects before resolving the Promise.
     */
    getInstances(extraConditions?: any): Promise<Array<any>>;

    /**
     * Gets the active Instances (i.e., {@link Instance.active} is true) that the current {@link Coordinator.user | User} has access to
     * (i.e., owned or shared with the user through resource sharing).
     * @returns A Promise that once resolved contains the active instances as they were returned from the broker. 
     * They should however nearly match the structure of the {@link Instance} class. If an error occurs the Promise will be rejected.
     * @todo Change Promise<Array<any>> to Promise<Array<Instance>> by converting the objects before resolving the Promise.
     */
    getActiveInstances(): Promise<Array<any>>;

    /**
     * Sets if the current {@link Coordinator.instance | Instance} is active (i.e., the application using the {@link Coordinator} is actively being used). 
     * @param active - It indicates whether the current {@link Coordinator.instance | Instance} should be set as active or inactive.
     * @return A Promise that once resolved contains the updated instance as it was returned from the broker. 
     * It should however nearly match the structure of the {@link Instance} class. If an error occurs the Promise will be rejected.
     * @todo Change Promise<any> to Promise<Instance> by converting the objects before resolving the Promise.
     */
    setInstanceActiveness(active: Boolean): Promise<any>;

    /**
     * Sets if the current {@link Coordinator.instance | Instance} is active by automatically determining if the application instance using the {@link Coordinator}
     * is actively being used by taking the value of "document.visibilityState" into consideration. 
     * @return A Promise that once resolved contains the updated instance as it was returned from the broker. 
     * It should however nearly match the structure of the {@link Instance} class. If an error occurs the Promise will be rejected.
     * @todo Change Promise<any> to Promise<Instance> by converting the objects before resolving the Promise.
     */
    updateInstanceActiveness(): Promise<any>;

    /**
     * Sets the distribution of components, and whether it was automatically or manually distributed, for the {@link Instance} with the given Id.
     * @param components - An object representing the distribution of components where the keys represent the name of the components
     * and the boolean values represent whether the components is shown (true) or not (false).
     * @param auto - It indicates if the distribution was automatically distributed (true) or manually set by a user (false). 
     * The distribution is assumed to be true by default.
     * @param instanceId - The Id of the {@link Instance} for which the distribution of components is being set.
     * The Id of the current instance ({@link Coordinator.instance}) is used by default.
     * @return A Promise that once resolved contains the updated instance as it was returned from the broker. 
     * It should however nearly match the structure of the {@link Instance} class. If an error occurs the Promise will be rejected.
     * @todo Change Promise<any> to Promise<Instance> by converting the objects before resolving the Promise.
     */
    setComponentDistribution(components: { [component: string]: boolean }, auto?: Boolean, instanceId?: string): Promise<any>;

    /**
     * Emits an event with a given value and a certain name.
     * @param value - A plain object with the information that is associated with the event.
     * @param name - A string with the name of the event.
     * @return A Promise that once resolved contains the created event as it was returned from the broker. If an error occurs the Promise will be rejected.
     * @todo Add a type definition to encapsulate the sent value.
     * @todo Create an Event class and change Promise<any> to Promise<Event> by converting the objects before resolving the Promise.
     */
    emitEvent(value: any, name: string): Promise<any>;

    /**
     * Subscribe to a {@link Resource} with a given Id by registering a function that is called whenever there are changes made to that {@link Resource} 
     * by clients connected to the broker. The {@link Coordinator} can only be subscribed to a resource. If it subscribes to another {@link Resource},
     * it will automatically call {@link Coordinator.unsubscribeResource}.
     * @param subscriberFunction - The function that gets called when a change to the subscribed {@link Resource} is received.
     * The function receives the resource data ({@link Resource.data}) and the type of event (created, updated, patched or removed) that generated the change.
     * @param resourceId - The Id of the {@link Resource} to subscribe to.
     * If the Id is not provided the Id of the currently selected {@link Resource} will be used by default.
     * @todo Add a type definition to encapsulate the received data.
     */
    subscribeResource(subscriberFunction: (data: any, eventType: string,) => void, resourceId?: string): Promise<any>;

    /**
     * Unsubscribe from any changes made to the currently subscribed to {@link Resource}.
     */
    unsubscribeResource(): void;

    /**
     * Subscribe to changes to made to {@link Resource} that a user has access to (i.e., owned or shared with).
     * __TIP__: This can be used to know when new resources are added/removed or shared/unshared.
     * @param subscriberFunction - The function that gets called when a change to a {@link Resource} that user has access to is received.
     * The function receives the resource data ({@link Resource.data}) and the type of event (created, updated, patched or removed) that generated the change.
     * @todo Add a type definition to encapsulate the received data.
     */
    subscribeResources(subscriberFunction: (data: any, eventType: string) => void): void;

    /**
     * Unsubscribe from any changes made to {@link Resource}s.
     */
    unsubscribeResources(): void;

    /**
     * Subscribe to changes made to the resource subscription, i.e., the information about which {@link Resource} is subscribed by the {@link Coordinator.user | User}. 
     * @param subscriberFunction - The function that gets called when the resource that the currently logged in {@link Coordinator.user | User} is subscribed to changes.
     * The function receives the resource subscription data directly from the broker and the type of event (created, updated, patched or removed) that generated the change.
     * @todo Add a ResourceSubscription class to encapsulate the data.
     */
    subscribeResourceSubscription(subscriberFunction: (data: any, eventType: string) => void): void;

    /**
     * Unsubscribe from any changes made to the resource subscription of the current {@link Coordinator.user | User}.
     */
    unsubscribeResourceSubscription(): void;

    /**
     * Subscribe to changes made to the proxemic relationships of the devices of the current {@link Coordinator.user | User} and possibly of other users that share access
     * to the same subscribed resource.
     * @param subscriberFunction - The function that gets called when the proxemic state of the currently logged in user {@link Coordinator.user | User} changes.
     * The function receives an updated {@link Proxemics} object and the type of event (created, updated, patched or removed) that generated the change.
     */
    subscribeProxemics(subscriberFunction: (data: Proxemics, eventType: string) => void): void;

    /**
     * Unsubscribe from any changes made to the proxemic state of the current {@link Coordinator.user | User}.
     */
    unsubscribeProxemics(): void;

    /**
     * Subscribe to changes made to the instances belonging to the current {@link Coordinator.user | User}, i.e., instances that become active/inactive or
     * that suffer changes to the distribution of UI components.
     * @param subscriberFunction - The function that gets called when an instance belonging to the currently logged in user {@link Coordinator.user | User} changes.
     * The function receives an {@link Instance} object representing the instance that changed 
     * and the type of event (created, updated, patched or removed) that caused the change.
     */
    subscribeInstances(subscriberFunction: (data: Instance, eventType: string) => void): void;

    /**
     * Unsubscribe from any changes made to the instances belonging to the current {@link Coordinator.user | User}.
     */
    unsubscribeInstances(): void;

    /**
     * Subscribe to events fired by the {@link Coordinator.user | User} while running the same {@link Coordinator.client | Client}. 
     * @param subscriberFunction - A function that receives a plain object with the information that is associated with the event and string with the type of the event.
     * @todo - Add a type definition that encapsulates the event data.
     */
    subscribeEvents(subscriberFunction: (data: any, eventType: string) => void): void;

    /**
     * Unsubscribe from receiveing any events fired by the {@link Coordinator.user | User} while running the same {@link Coordinator.client | Client}.
     */
    unsubscribeEvents(): void;

    /**
     * Subscribe to get reinitialization information from the {@link Coordinator} whenever the connection to the broker is reestablished after a disconnect.
     * @param subscriberFunction - A function that receives the data of default resource ({@link Coordinator.resource}), 
     * information about the proxemic state and the Id of the default resource.
     */
    subscribeReconnects(subscriberFunction: (resourceData: any, proxemics: Proxemics, resourceId: string) => void): void;

    /**
     * Unsubscribe to reconnection events.
     */
    unsubscribeReconnects(): void;

    /**
     * Logs out from the broker.
     */
    logout(): void;

    /**
     * Checks if the {@link Coordinator} is connected to the broker.
     * @return A boolean which indicated if the {@link Coordinator} is connhected (true) or not (false).
     */
    isConnected(): boolean;

    /**
     * Update the distribution of UI components according to our restrictions by using {@link ComponentsRuleEngine}.
     * A "configureComponents" function should be passed to be called with the newly determined distribution for the current {@link Instance}.
     * If you are using {@link ComponentsDistributionElement} it can be passed so that it gets automatically updated.
     * 
     * 
     * @param componentsRuleEngine - The {@link ComponentsRuleEngine} instance to be used to redistribute the UI components.
     * @param configureComponents - Function should be passed to be called with the newly determined distribution for the current {@link Instance}.
     * @param componentsDistributionElement - A {@link ComponentsDistributionElement} that can get automatically updated with the changes.
     * @param instanceId - If not passed the Id of the {@link Coordinator.instance} will automatically be used.
     * @param ignoreManual - A boolean flag that instructs the {@link ComponentsRuleEngine} to ignore the manual distribution set by the user. It is "false" by default.
     */
    updateComponentsDistribution(
        componentsRuleEngine: ComponentsRuleEngine,
        configureComponents: (cd: ComponentsDistribution) => void,
        componentsDistributionElement?: ComponentsDistributionElement,
        instanceId?: string,
        ignoreManual?: boolean): Promise<void>

    /**
     * This is a helper method that distributes components by calling {@link Coordinator.setComponentDistribution}
     * based on 'updated-components-distribution' event generated by the {@link ComponentsDistributionElement}.
     * @param e - An 'updated-components-distribution' event generated by the {@link ComponentsDistributionElement}.
     */
    distributeComponents(e: CustomEvent): Promise<void>

    /**
     * This is a helper method that clears the distribution of components by calling {@link Coordinator.setComponentDistribution}
     * after received 'reset-auto-components-distribution' event generated by the {@link ComponentsDistributionElement}.
     * @param e - An 'updated-components-distribution' event generated by the {@link ComponentsDistributionElement}.
     */
    clearComponentsDistribution(e: CustomEvent): Promise<void>
}

export default Coordinator;