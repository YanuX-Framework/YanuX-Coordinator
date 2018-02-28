import Coordinator from "./Coordinator";
import AbstractCoordinator from "./AbstractCoordinator";
import DeepstreamCoordinator from "./DeepstreamCoordinator";
import App from "./App";
import User from "./User";

var coordinator = new DeepstreamCoordinator("ws://localhost:6020/deepstream", new App("demo"), new User("jonhdoe", { password: "password123456" }));

export {
    Coordinator,
    AbstractCoordinator,
    DeepstreamCoordinator,
    App,
    User
};