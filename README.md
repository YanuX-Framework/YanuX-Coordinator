# YanuX Coordinator
This is part of the [__YanuX Framework__](https://yanux-framework.github.io/). It is a [__TypeScript__](https://www.typescriptlang.org/) library that allows developers to connect their application code to the [__YanuX Framework__](https://yanux-framework.github.io/), namely the [__YanuX Auth__](https://github.com/YanuX-Framework/YanuX-Auth) and [__YanuX Broker__](https://github.com/YanuX-Framework/YanuX-Broker) components.

It abstracts the communication the [__YanuX Broker__](https://github.com/YanuX-Framework/YanuX-Broker) [__API__](https://yanux-framework.github.io/YanuX-Broker/) and provides tools for the [automatic distribution of UI components based on device capabilities](https://yanux-framework.github.io/YanuX-Coordinator/classes/componentsruleengine.html), [and their manual redistribution](https://yanux-framework.github.io/YanuX-Coordinator/classes/componentsdistributionelement.html), as well as the [management and sharing of running application states](https://yanux-framework.github.io/YanuX-Coordinator/classes/resourcemanagementelement.html).

## Documentation
- [__API Documentation__](https://yanux-framework.github.io/YanuX-Coordinator/)
- [__JSON Schema of the Domain Specific Language for Specifying Restrictions on the Placement of UI Components__](extras/components-restriction-language/components-restriction-schema.json)

### TO DO:
- Provide additional documentation.
- Migrate from **LitElement 2.x**/**lit-html 1.x** to **Lit 2.0** by following this guide: https://lit.dev/docs/releases/upgrade/
- Migrate to a newer `socket.io-client` package once supported by **Feathers**.
- Perhaps I should replace `jose` with `jsrsasign` since it may better support pure **JavaScript** environments.

## License
This work is licensed under [__Apache License 2.0__](LICENSE)