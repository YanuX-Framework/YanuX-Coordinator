/**
 * TODO: 
 * Perhaps I should create tests using a true testing library.
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

    const brokerUrl: string = 'http://localhost:3002';
    const localDeviceUrl: string = 'http://localhost:3003';
    const clientId = 'yanux-coordinator-test';

    /**
     * NOTE: 
     * Use the following URL to get a new token if needed.
     * http://localhost:3001/oauth2/authorize?client_id=yanux-coordinator-test&client_secret=topsecret_client_secret&response_type=token&redirect_uri=http://localhost:3003/
     */
    const credentials: Credentials = new Credentials('yanux', [
        '',
        clientId
    ]);

    const brokerPublicKey: string =
        `-----BEGIN PUBLIC KEY-----
    MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAw/YczpxmtzaEh853mdJ+
    HDKXi1IFqMcoIV1m75TcB9oBpAOPpdnwlDAij9dla76ZgAnJE3XoXpSsNVMObMuQ
    7p7HwMI/JqhBJy+tX+HSB0pFiNO9MDqnZRqQZDapnmV2biZ11PFY//YIlqKeoh7x
    mHmD1fykBw3pj+l71Cjyzr4lXjXnq1460pBTS5/T5gGjE09spMzP/ZlSAydZDXht
    ycmbDV6mCoM6qkpNNt7hjZl6eE9py3WrZPp8mcT5GLGB3H1o2mr160hOpto+Z8mF
    WIExf3FVq0IzLQAyYpkPYz7Z/ejEquuAxRjMJMG9cht+yIOmc4H04lIOPcDuPAKa
    D4IZkWSkMw2lbsYU2NBrWObLVjeE7U3sGRH9/Jznnyr4FH2pW924jy2YYX9r5Qgj
    nW2E5Kx6hFAHGEAQi9SEvqKsbCp5t4g3F44mA197a1GEmsJ8sagkaF+4sJG4p6H7
    HGyyDp7wfya4Ay/+JnlNA2htfppdys/wcYmyRfR8ekAxHhiF21UPej+rkEAnjar6
    vg7brx4fc0jqoKUWECiNB3j/x7E9i60ZEvhtG7AjY8Qq3nkyqWJ1ivrkna8KdpMn
    WLa5mpfMdi8e2E0wSdw+oL3mmP5nb8Zu6HmjnkK+OYGIwisZHyM/Q92wOehi7yUD
    MrAGsRdOJYBH9RnGc6m9UgUCAwEAAQ==
    -----END PUBLIC KEY-----
    `;

    console.log('Loaded the following broker public key:', brokerPublicKey);
    const coordinator: FeathersCoordinator = new FeathersCoordinator(brokerUrl, localDeviceUrl, clientId, credentials, brokerPublicKey);
    const resourceId = '5ec32079ea2fd5765ebd5803';

    coordinator.subscribeResources((data, eventType) => console.log(`Resource ${eventType}:`, data));
    coordinator.subscribeResource((data, eventType) => console.log(`Data ${eventType}:`, data), resourceId);
    coordinator.subscribeEvents((data, eventType) => console.log(`Event ${eventType}:`, data))

    try {
        const result = await coordinator.init();
        console.log('--- init ---:\n', result);
        console.log('--- getResources ---:\n', await coordinator.getResources(true, true));
        console.log('--- getResourceData ---:\n', await coordinator.getResourceData(resourceId));
        console.log('--- setResourceData ---:\n', await coordinator.setResourceData({ message: 'in a bottle' }, resourceId));
        console.log('--- shareResource ---:\n', await coordinator.shareResource('test_developer_0@yanux.org', resourceId));
        console.log('--- emitEvent ---:\n', await coordinator.emitEvent({ test: 'Hello World' }, 'test-event'));
        const newResource = await coordinator.createResource('Bottled Message');
        console.log('--- createResource ---:\n', newResource);
        console.log('--- unshareResource ---:\n', await coordinator.unshareResource('test_developer_0@yanux.org', resourceId));
        console.log('--- deleteResource ---:\n', await coordinator.deleteResource(newResource.id));
    } catch (e) {
        console.error(e);
    }
}


async function testComponentsRuleEngine() {
    console.log('Testing ComponentsRuleEngine');
    class ObjectId {
        public id: string;
        constructor(id: string) {
            this.id = id;
        }
        toString() {
            return this.id;
        }
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