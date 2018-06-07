"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resource = /** @class */ (function () {
    function Resource(app, user, resource) {
        if (resource === void 0) { resource = {}; }
        this.app = app;
        this.user = user;
        this.update(resource);
    }
    Resource.prototype.update = function (resource) {
        this.id = resource._id;
        this.app.name = resource.app ? resource.app : this.app.name;
        this.user.username = resource.user ? resource.user : this.user.username;
        this.data = resource.data;
        this.createdAt = new Date(resource.createdAt);
        this.updatedAt = new Date(resource.updatedAt);
        // Saving the full object "just in case".
        this.lastResourceChange = resource;
    };
    return Resource;
}());
exports.default = Resource;
//# sourceMappingURL=Resource.js.map