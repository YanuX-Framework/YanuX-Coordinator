"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var authentication_client_1 = require("@feathersjs/authentication-client");
var errors_1 = require("@feathersjs/errors");
var feathers_1 = require("@feathersjs/feathers");
var socketio_client_1 = require("@feathersjs/socketio-client");
var Promise = require("bluebird");
var io = require("socket.io-client");
var AbstractCoordinator_1 = require("./AbstractCoordinator");
var Resource_1 = require("./Resource");
var ResourceNotFoundError_1 = require("./errors/ResourceNotFoundError");
var FeathersCoordinator = /** @class */ (function (_super) {
    __extends(FeathersCoordinator, _super);
    function FeathersCoordinator(url, app, user, localStorageLocation) {
        if (localStorageLocation === void 0) { localStorageLocation = "./data/localstorage"; }
        var _this = _super.call(this) || this;
        _this.resource = new Resource_1.default(app, user);
        _this.socket = io(url);
        _this.client = feathers_1.default();
        _this.client.configure(socketio_client_1.default(_this.socket));
        _this.service = _this.client.service('resources');
        if (typeof window.localStorage === "undefined" || window.localStorage === null) {
            var NodeLocalStorage = require('node-localstorage').LocalStorage;
            _this.storage = new NodeLocalStorage(localStorageLocation);
        }
        else {
            _this.storage = window.localStorage;
        }
        _this.client.configure(authentication_client_1.default({ storage: _this.storage }));
        // TODO: Implement a proper generic logger system that I can use across this whole project (perhaps across all my projects).
        var eventCallback = function (evenType) { return function (event) { return console.log(evenType + ":", event); }; };
        _this.client.on('authenticated', eventCallback('authenticated'));
        _this.client.on('logout', eventCallback('logout'));
        _this.client.on('reauthentication-error', eventCallback('reauthentication-error'));
        return _this;
    }
    FeathersCoordinator.prototype.init = function (subscriberFunction) {
        var _this = this;
        if (subscriberFunction === void 0) { subscriberFunction = null; }
        return new Promise(function (resolve, reject) {
            _this.client.authenticate({
                strategy: 'local',
                email: _this.resource.user.username,
                password: _this.resource.user.credentials
            }).then(function (response) {
                if (subscriberFunction) {
                    _this.subscribe(subscriberFunction);
                }
                return _this.service.create({
                    app: _this.resource.app.name,
                    user: _this.resource.user.username
                });
            }).then(function (resource) { return resolve(_this.getData()); })
                .catch(function (err) {
                if (!(err instanceof errors_1.Conflict)) {
                    reject(err);
                }
                else {
                    return resolve(_this.getData());
                }
            });
        });
    };
    FeathersCoordinator.prototype.getResource = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.service.find({
                query: {
                    user: _this.resource.user.username,
                    app: _this.resource.app.name
                }
            }).then(function (resources) {
                if (resources.length === 1) {
                    _this.resource.update(resources[0]);
                    return resolve(_this.resource);
                }
                else {
                    reject(new ResourceNotFoundError_1.default('Could not find the resource associated with the current application/user pair.'));
                }
            }).catch(function (err) { return reject(err); });
        });
    };
    FeathersCoordinator.prototype.getData = function () {
        return this.getResource().then(function (resource) { return resource.data; }).catch(function (err) { return Promise.reject(err); });
    };
    FeathersCoordinator.prototype.setData = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.service.patch(_this.resource.id, { data: data })
                .then(function (resource) {
                resolve(resource.data);
            }).catch(function (err) { return reject(err); });
        });
    };
    FeathersCoordinator.prototype.subscribe = function (subscriberFunction) {
        var _this = this;
        var eventListener = function (resource, eventType) {
            if (eventType === void 0) { eventType = 'updated'; }
            // TODO: This should be enforced at the Broker level.
            if (_this.resource.id === resource._id
                && _this.resource.app.name === resource.app
                && _this.resource.user.username === resource.user) {
                _this.resource.update(resource);
                subscriberFunction(_this.resource.data, eventType);
            }
            else {
                console.error('I\'m getting events that I shouldn\'t have heard about.');
            }
        };
        this.service.on('updated', function (resource) { return eventListener(resource, 'updated'); });
        this.service.on('patched', function (resource) { return eventListener(resource, 'patched'); });
    };
    return FeathersCoordinator;
}(AbstractCoordinator_1.default));
exports.default = FeathersCoordinator;
//# sourceMappingURL=FeathersCoordinator.js.map