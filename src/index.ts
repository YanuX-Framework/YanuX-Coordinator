import Coordinator from "./Coordinator";
import AbstractCoordinator from "./AbstractCoordinator";
import App from "./App";
import User from "./User";
import FeathersCoordinator from "./FeathersCoordinator";

/** TODO: Create "proper" tests. */
function test(): void {
    let url: string = "http://localhost:3030";
    let app: App = new App("demo");
    let user: User = new User("pedro@albuquerques.net", "topsecret");
    let coordinator: FeathersCoordinator = new FeathersCoordinator(url, app, user);
    coordinator.init()
        .then(result => {
            console.log('State:', result);
            return coordinator.setData({ myfavoritenumber: [8, 19, 88, 1988] });
        }).then(data => console.log('Data: ', data))
        .catch(error => console.log('Error:', error));
    coordinator.subscribe(data => console.log('Data Changed: ', data));
}

test();

export {
    Coordinator,
    AbstractCoordinator,
    FeathersCoordinator,
    App,
    User
};