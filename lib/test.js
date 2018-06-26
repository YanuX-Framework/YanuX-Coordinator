"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
/** TODO: Create "proper" tests. */
function test() {
    var url = "http://localhost:3030";
    var app = new index_1.App("demo");
    var user = new index_1.User("pedro@albuquerques.net", "topsecret");
    var coordinator = new index_1.FeathersCoordinator(url, app, user);
    coordinator.init()
        .then(function (result) {
        console.log('State:', result);
        return coordinator.setData({ myfavoritenumber: [8, 19, 88, 1988] });
    }).then(function (data) { return console.log('Data: ', data); })
        .catch(function (error) { return console.log('Error:', error); });
    coordinator.subscribe(function (data) { return console.log('Data Changed: ', data); });
}
test();
//# sourceMappingURL=test.js.map