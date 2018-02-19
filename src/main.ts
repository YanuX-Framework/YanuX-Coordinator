import * as yxc from "./Coordinator"
export {yxc};

var coordinator = new yxc.Coordinator("ws://localhost:6020/deepstream", { username: "john", password: "doe" });