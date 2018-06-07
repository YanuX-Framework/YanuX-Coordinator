"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//TODO: Flesh-out this class with other important user properties.
var User = /** @class */ (function () {
    function User(username, credentials) {
        this.username = username;
        this.credentials = credentials;
    }
    Object.defineProperty(User.prototype, "username", {
        get: function () {
            return this._username;
        },
        set: function (username) {
            this._username = username;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "credentials", {
        get: function () {
            return this._credentials;
        },
        set: function (credentials) {
            this._credentials = credentials;
        },
        enumerable: true,
        configurable: true
    });
    return User;
}());
exports.default = User;
//# sourceMappingURL=User.js.map