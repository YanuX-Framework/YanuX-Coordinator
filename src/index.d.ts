/**
 * Declaring some modules that do not have type information.
 */

 /**
  * Type module for SVG files
  */
declare module "*.svg" {
    const content: any;
    export default content;
}

/**
 * Type module for the 'node-rules' packages.
 */
declare module 'node-rules';

/**
 * Type module for the 'node-localstorage' package, which implements a "Web Storage API" on Node.js.
 */
declare module 'node-localstorage' {
    var LocalStorage: {
        new(location: string): Storage;
        new(location: string, quota: number): Storage;
    };
}

