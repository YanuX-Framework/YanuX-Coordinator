export const instanceId = '5e1f1f35167afc2aaa1515b0';

export const componentsDistribution = {
    '5e1f1f35167afc2aaa1515b0': {
        name: 'Instance 01',
        device: {
            uuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf08',
            name: 'Laptop'
        },
        auto: true,
        components: { screen: true, keypad: false }
    },

    '5e1f1f35167afc2aaa1515b1': {
        name: 'Instance 02',
        device: {
            uuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf08',
            name: 'Laptop'
        },
        auto: false,
        components: { screen: true, keypad: false }
    },

    '5e1f1f35167afc2aaa1515b2': {
        name: 'Instance 01',
        device: {
            uuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf09',
            name: 'Smartphone'
        },
        auto: false,
        components: { screen: false, keypad: true }
    }
};

export const resources = [{
    id: '5e8264de675b5b44325d8dff',
    owner: 'test_developer_0@yanux.org',
    user: {
        id: '5e879dc892bb3a6fd92d3c00',
        email: 'test_developer_0@yanux.org'
    },
    default: true,
    sharedWith: [{
        id: '5e879dc892bb3a6fd92d3c10',
        email: 'test_user_10@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c11',
        email: 'test_user_11@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c12',
        email: 'test_user_12@yanux.org'
    }]
}, {
    id: '5e84f4950f5de41614105259',
    owner: 'test_user_0@yanux.org',
    user: {
        id: '5e879dc892bb3a6fd92d3c01',
        email: 'test_user_0@yanux.org'
    },
    name: 'Bottled Message',
    default: false,
    sharedWith: [{
        id: '5e879dc892bb3a6fd92d3c10',
        email: 'test_user_10@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c11',
        email: 'test_user_11@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c12',
        email: 'test_user_12@yanux.org'
    }]
}, {
    id: '5e879dc892bb3a6fd92d3c15',
    owner: 'test_user_1@yanux.org',
    name: 'Bottled Message',
    default: false
}];