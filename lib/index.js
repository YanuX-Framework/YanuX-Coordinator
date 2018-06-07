"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractCoordinator_1 = require("./AbstractCoordinator");
exports.AbstractCoordinator = AbstractCoordinator_1.default;
var App_1 = require("./App");
exports.App = App_1.default;
var User_1 = require("./User");
exports.User = User_1.default;
var FeathersCoordinator_1 = require("./FeathersCoordinator");
exports.FeathersCoordinator = FeathersCoordinator_1.default;
/** TODO: Create "proper" tests. */
function test() {
    var url = "http://localhost:3030";
    var app = new App_1.default("demo");
    var user = new User_1.default("pedro@albuquerques.net", "topsecret");
    var coordinator = new FeathersCoordinator_1.default(url, app, user);
    coordinator.init()
        .then(function (result) {
        console.log('State:', result);
        return coordinator.setData({ myfavoritenumber: [8, 19, 88, 1988] });
    }).then(function (data) { return console.log('Data: ', data); })
        .catch(function (error) { return console.log('Error:', error); });
    coordinator.subscribe(function (data) { return console.log('Data Changed: ', data); });
}
test();
//# sourceMappingURL=index.js.map