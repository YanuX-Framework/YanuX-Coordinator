import Coordinator from "./Coordinator";
import AbstractCoordinator from "./AbstractCoordinator";
import DeepstreamCoordinator from "./FeathersCoordinator";
import App from "./App";
import User from "./User";
import FeathersCoordinator from "./FeathersCoordinator";

let url : string = "http://localhost:3030";
let app : App = new App("demo");
console.log('App: ', app);
let user : User = new User("pedro@albuquerques.net", { password: "topsecret" });
console.log('User: ', user);

let coordinator : FeathersCoordinator = new FeathersCoordinator(url, app, user);
//var coordinator = new DeepstreamCoordinator("ws://localhost:6020/deepstream", new App("demo"), new User("jonhdoe", { password: "password123456" }));

export {
    Coordinator,
    AbstractCoordinator,
    //DeepstreamCoordinator,
    App,
    User
};