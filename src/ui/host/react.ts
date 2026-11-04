import type * as ReactTypes from "react";

// ModuleLoader supplies this require. Never resolve React from the plugin package.
declare const require: (id: "react") => typeof ReactTypes;
export const React = require("react");
export const h = React.createElement;
export default React;
