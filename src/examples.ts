export const instanceId = '5e1f1f35167afc2aaa1515b0';

export const componentsDistribution = {
    '5e1f1f35167afc2aaa1515b0': {
        name: 'Instance 1',
        device: {
            uuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf08',
            name: 'Laptop'
        },
        auto: true,
        components: { 'Video Call': true, 'Camera': false, 'Chat Messages': false, 'Chat Input': false }
    },

    '5e1f1f35167afc2aaa1515b1': {
        name: 'Instance 2',
        device: {
            uuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf08',
            name: 'Laptop'
        },
        auto: true,
        components: { 'Video Call': false, 'Camera': true, 'Chat Messages': false, 'Chat Input': false }
    },

    '5e1f1f35167afc2aaa1515b2': {
        name: 'Instance 1',
        device: {
            uuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf09',
            name: 'Tablet'
        },
        auto: true,
        components: { 'Video Call': false, 'Camera': false, 'Chat Messages': true, 'Chat Input': false }
    },

    '5e1f1f35167afc2aaa1515b3': {
        name: 'Instance 1',
        device: {
            uuid: '9ab8e750-bc1e-11e8-a769-3f2e91eebf10',
            name: 'Smartphone'
        },
        auto: true,
        components: { 'Video Call': false, 'Camera': false, 'Chat Messages': false, 'Chat Input': true }
    }
};

export const resources = [{
    id: '5e8264de675b5b44325d8dff',
    owner: 'developer0@yanux.org',
    user: {
        id: '5e879dc892bb3a6fd92d3c00',
        email: 'developer0@yanux.org'
    },
    default: true,
    sharedWith: [{
        id: '5e879dc892bb3a6fd92d3c10',
        email: 'user10@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c11',
        email: 'user11@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c12',
        email: 'user12@yanux.org'
    }]
}, {
    id: '5e84f4950f5de41614105259',
    owner: 'test_user_0@yanux.org',
    user: {
        id: '5e879dc892bb3a6fd92d3c01',
        email: 'test_user_0@yanux.org'
    },
    name: 'Room #1',
    default: false,
    sharedWith: [{
        id: '5e879dc892bb3a6fd92d3c10',
        email: 'user10@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c11',
        email: 'user11@yanux.org'
    }, {
        id: '5e879dc892bb3a6fd92d3c12',
        email: 'user12@yanux.org'
    }]
}, {
    id: '5e879dc892bb3a6fd92d3c15',
    owner: 'user1@yanux.org',
    name: 'Room #2',
    default: false
}];