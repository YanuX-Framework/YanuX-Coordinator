import Coordinator from "./Coordinator";
import AbstractCoordinator from "./AbstractCoordinator";
import DeepstreamCoordinator from "./FeathersCoordinator";
import App from "./App";
import User from "./User";
import FeathersCoordinator from "./FeathersCoordinator";

let url : string = "http://localhost:3030";
let app : App = new App("demo");
let user : User = new User("pedro@albuquerques.net", "topsecret");
let coordinator : FeathersCoordinator = new FeathersCoordinator(url, app, user);
coordinator.init().then(result => console.log(result));

export {
    Coordinator,
    AbstractCoordinator,
    FeathersCoordinator,
    App,
    User
};