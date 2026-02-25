import { INodeType } from '@my8m/core';
import { HttpRequestNode } from './HttpRequests/HttpRequest.node';
import { CodeNode } from './Code/Code.node';

// Central Registry Map for dynamic loading
export const NodeRegistry = new Map<string, INodeType>();

const register = (typeClass: new () => INodeType) => {
    const instance = new typeClass();
    NodeRegistry.set(instance.description.name, instance);
};

// Instead of reflection, manually register the official nodes here
register(HttpRequestNode);
register(CodeNode);

/**
 * Returns a generic schema representation of all loaded nodes
 * so the frontend UI can dynamically construct the properties sidebar.
 */
export const getAvailableNodes = () => {
    return Array.from(NodeRegistry.values()).map(node => node.description);
};
