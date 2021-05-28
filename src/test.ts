/**
 * This is just a file that used to run and test the {@link FeathersCoordinator} and the {@link ComponentsRuleEngine} in isolation by running them directly with/on Node.js.
 * @todo Perhaps I should create tests using a true testing library.
 * However, it may not be somethign straightforward due to the network/async/browser nature of this library. 
 */

import FeathersCoordinator from './FeathersCoordinator';
import Credentials from './Credentials';
import ComponentsRuleEngine from './ComponentsRuleEngine';

async function test() {
    console.log('Running tests')
    await testFeathersCoordinator();
    //await testComponentsRuleEngine();
}
test();

async function testFeathersCoordinator() {
    console.log('Testing FeathersCoordinator');

    const brokerUrl: string = 'http://192.168.12.1:3002';
    const localDeviceUrl: string = 'http://192.168.12.1:3003';
    const clientId = 'yanux-coordinator-test';

    /**
     * NOTE: 
     * Use the following URL to get a new token if needed.
     * http://localhost:3001/oauth2/authorize?client_id=yanux-coordinator-test&client_secret=topsecret_client_secret&response_type=token&redirect_uri=http://localhost:3003/
     */
    const credentials: Credentials = new Credentials('yanux', [
        'VQGGhAQxVeiJHk35FJGoNM31G7Ciogh1mDmlYyBap0naXyl1n03l7pTe9AfI1aXAcHdDTraxiTEAp5tO10eK7Ph4f4euDrm3HFJSezoeBwuvxRQlaDOGxfjXIV2RVwYh6s0KCzOckZIc6snC5W2e2fDp2kL2J4ja23PTOXV8UD6k9itrz92evZsyG6Q5NwWO6sDGcCrQdVU2r9WLLm6GUTa0841ZYV03WxpCQsBMFhqRIBZVtPHpfJMCyBroMGZh',
        clientId
    ]);

    const coordinator: FeathersCoordinator = new FeathersCoordinator(brokerUrl, localDeviceUrl, clientId, credentials);
    coordinator.subscribeResources((data, eventType) => console.log(`Resource ${eventType}:`, data));
    coordinator.subscribeEvents((data, eventType) => console.log(`Event ${eventType}:`, data))
    // const resourceId = '5ec32079ea2fd5765ebd5803';
    // coordinator.subscribeResource((data, eventType) => console.log(`Data ${eventType}:`, data), resourceId);
    try {
        const result = await coordinator.init();
        console.log('--- init ---:\n', result);
        console.log('--- user ---:\n', coordinator.user);
        // console.log('--- getResources ---:\n', await coordinator.getResources(true, true));
        // console.log('--- getResourceData ---:\n', await coordinator.getResourceData(resourceId));
        // console.log('--- setResourceData ---:\n', await coordinator.setResourceData({ message: 'in a bottle' }, resourceId));
        // console.log('--- shareResource ---:\n', await coordinator.shareResource('test_developer_0@yanux.org', resourceId));
        // console.log('--- emitEvent ---:\n', await coordinator.emitEvent({ test: 'Hello World' }, 'test-event'));
        // const newResource = await coordinator.createResource('Bottled Message');
        // console.log('--- createResource ---:\n', newResource);
        // console.log('--- unshareResource ---:\n', await coordinator.unshareResource('test_developer_0@yanux.org', resourceId));
        // console.log('--- deleteResource ---:\n', await coordinator.deleteResource(newResource.id));
    } catch (e) { console.error(e); }
}

async function testComponentsRuleEngine() {
    console.log('Testing ComponentsRuleEngine');
    class ObjectId {
        public id: string;
        constructor(id: string) { this.id = id; }
        toString() { return this.id; }
    }
    const localInstanceUuid = '0ea41404-86a7-42d7-980c-f343ef66df10';
    const localDeviceUuid = '3d42affa-3685-47f2-97d0-bd4ff46de5c6';
    const instances = [
        {
            _id: new ObjectId('5cb4c511eb479c2e46a7a20d'),
            active: true,
            brokerName: 'YanuX-Broker',
            user: new ObjectId('5cb4c3b2eb479c2e46a785d7'),
            client: new ObjectId('5cb4c50feb479c2e46a7a1e2'),
            device: {
                _id: new ObjectId('5cb4c420eb479c2e46a78969'),
                beaconValues: [
                    '113069EC-6E64-4BD3-6810-DE01B36E8A3E',
                    1,
                    101
                ],
                brokerName: 'YanuX-Broker',
                deviceUuid: '3d42affa-3685-47f2-97d0-bd4ff46de5c6',
                user: new ObjectId('5cb4c3b2eb479c2e46a785d7'),
                createdAt: new Date('2019-04-15T17:49:20.145Z'),
                updatedAt: new Date('2019-04-15T18:01:02.481Z'),
                __v: 0
            },
            instanceUuid: '0ea41404-86a7-42d7-980c-f343ef66df10',
            createdAt: new Date('2019-04-15T17:53:21.038Z'),
            updatedAt: new Date('2019-04-15T17:54:32.525Z'),
            __v: 0
        },
        {
            _id: new ObjectId('5cb4c532eb479c2e46a7a43b'),
            active: true,
            brokerName: 'YanuX-Broker',
            user: new ObjectId('5cb4c3b2eb479c2e46a785d7'),
            client: new ObjectId('5cb4c50feb479c2e46a7a1e2'),
            device: {
                _id: new ObjectId('5cb4c3b2eb479c2e46a785d8'),
                beaconValues: [
                    '113069EC-6E64-4BD3-6810-DE01B36E8A3E',
                    1,
                    100
                ],
                brokerName: 'YanuX-Broker',
                deviceUuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf08',
                user: new ObjectId('5cb4c3b2eb479c2e46a785d7'),
                createdAt: new Date('2019-04-15T17:47:30.957Z'),
                updatedAt: new Date('2019-04-15T17:47:30.957Z'),
                __v: 0
            },
            instanceUuid: '9057a01c-9854-486d-9a11-cc4af4d7d5b8',
            createdAt: new Date('2019-04-15T17:53:54.870Z'),
            updatedAt: new Date('2019-04-15T17:53:54.880Z'),
            __v: 0
        }
    ];
    const proxemics = {
        _id: new ObjectId('5cb4c3d0eb479c2e46a785dc'),
        brokerName: 'YanuX-Broker',
        user: '5cb4c3b2eb479c2e46a785d7',
        state: {
            '3d42affa-3685-47f2-97d0-bd4ff46de5c6': {
                display: [{
                    resolution: [1280, 1080],
                    pixelDensity: 96,
                    bitDepth: 24,
                    size: [481, 271],
                    refreshRate: 60
                }, {
                    resolution: [1024, 1080],
                    pixelDensity: 96,
                    bitDepth: 24,
                    size: [481, 271],
                    refreshRate: 60
                }],
                speakers: {
                    type: 'loudspeaker',
                    channels: 2,
                },
                camera: {
                    resolution: [1280, 720],
                },
                microphone: {
                    channels: 1,
                },
                input: ['keyboard', 'mouse'],
                sensors: [] as any[]
            },
            '9ab8e750-bc1e-11e8-a769-3f2e91eebf08': {
                display: {
                    resolution: [1920, 1080],
                    pixelDensity: 96,
                    bitDepth: 24,
                    size: [481, 271],
                    refreshRate: 60
                },
                speakers: {
                    type: 'loudspeaker',
                    channels: 4,
                },
                camera: {
                    resolution: [1280, 720],
                },
                microphone: {
                    channels: 1,
                },
                input: ['keyboard', 'mouse'],
                sensors: [] as any[]
            }
        },
        updatedAt: new Date('2019-04-15T17:56:57.834Z'),
        createdAt: new Date('2019-04-15T17:56:57.834Z')
    };
    const restrictions = {
        'viewer-form': {
            display: true,
            input: {
                operator: 'OR',
                values: [{
                    operator: 'AND',
                    values: ['keyboard', 'mouse']
                }, 'touchscreen']
            }
        },
        player: {
            display: {
                operator: 'AND',
                values: {
                    resolution: {
                        operator: '>=',
                        value: [1280, null],
                    },
                    size: {
                        operator: '>=',
                        value: [160, 90],
                    },
                    pixelDensity: {
                        operator: 'NOT',
                        values: {
                            operator: '>',
                            value: 150
                        }
                    },
                }
            },
            speakers: {
                channels: [
                    {
                        operator: '>=',
                        value: 2,
                        enforce: true
                    },
                    {
                        operator: '>=',
                        value: 1,
                    }
                ]
            }
        }
    };
    const componentsRuleEngine = new ComponentsRuleEngine(localInstanceUuid, localDeviceUuid, restrictions, proxemics.state, instances);
    const data = await componentsRuleEngine.run();
    console.log('Components Config:', data.componentsConfig);
    console.log('Capabilities:', data.capabilities);
}