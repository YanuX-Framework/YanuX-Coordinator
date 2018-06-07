"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//TODO: Flesh-out this class with other important applicatio properties.
var App = /** @class */ (function () {
    function App(name) {
        this._name = name;
    }
    Object.defineProperty(App.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    return App;
}());
exports.default = App;
//# sourceMappingURL=App.js.map