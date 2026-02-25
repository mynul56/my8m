import { IWorkflowNode, IWorkflowConnection, IItem, INodeContext, INodeType } from './interfaces';

// A mock state tracker to replace the DB calls for this basic script
export class StateTracker {
    steps: Record<string, any> = {};

    async markRunning() { console.log('Execution Started'); }
    async markCompleted() { console.log('Execution Completed'); }
    async markFailed(err: any) { console.error('Execution Failed:', err); }

    saveStep(nodeId: string, output: any, status: 'SUCCESS' | 'WARNING') {
        this.steps[nodeId] = { status, output };
        console.log(`[Node ${nodeId}] finished with status: ${status}`, JSON.stringify(output));
    }
}

export class ExecutionEngine {
    private nodes: Map<string, IWorkflowNode>;
    private connections: IWorkflowConnection[];
    private nodeTypes: Map<string, INodeType>; // Registry of available node types

    constructor(nodesArray: IWorkflowNode[], connections: IWorkflowConnection[], registry: Map<string, INodeType>) {
        this.nodes = new Map(nodesArray.map(n => [n.id, n]));
        this.connections = connections;
        this.nodeTypes = registry;
    }

    // Find nodes that have no incoming connections (triggers/start nodes)
    private getStartNodes(): IWorkflowNode[] {
        const targets = new Set(this.connections.map(c => c.target));
        return Array.from(this.nodes.values()).filter(n => !targets.has(n.id));
    }

    private getReadyChildren(nodeId: string, state: StateTracker): IWorkflowNode[] {
        const outgoing = this.connections.filter(c => c.source === nodeId);
        const ready = [];

        for (const edge of outgoing) {
            const targetNode = this.nodes.get(edge.target);
            if (!targetNode) continue;

            // Check if all of targetNode's incoming edges have a completed step in state
            const incomingEdges = this.connections.filter(c => c.target === targetNode.id);
            const allParentsDone = incomingEdges.every(inEdge => state.steps[inEdge.source]?.status === 'SUCCESS' || state.steps[inEdge.source]?.status === 'WARNING');

            if (allParentsDone) {
                ready.push(targetNode);
            }
        }
        return ready;
    }

    private buildContext(node: IWorkflowNode, state: StateTracker, initialInput: any): INodeContext {
        return {
            getInputData: () => {
                // Collect data from parent node outputs
                const incomingEdges = this.connections.filter(c => c.target === node.id);
                if (incomingEdges.length === 0) {
                    // It's a start node, return the initial trigger payload
                    return [{ json: initialInput }];
                }

                let allItems: IItem[] = [];
                for (const edge of incomingEdges) {
                    const parentOutput = state.steps[edge.source]?.output;
                    // Assume standard format `IItem[][]`
                    if (parentOutput && parentOutput[edge.sourceOutputIndex || 0]) {
                        allItems = allItems.concat(parentOutput[edge.sourceOutputIndex || 0]);
                    }
                }
                return allItems;
            },
            getCredentials: async () => ({}),
            continueOnFail: () => !!node.continueOnFail,
            log: (msg) => console.log(`[${node.name}]:`, msg),
            getNodeParameter: (paramName, index, fallback) => node.parameters[paramName] ?? fallback
        };
    }

    async run(triggerData: any, stateTracker: StateTracker) {
        const queue = this.getStartNodes();

        // To prevent processing the same node multiple times in a split-join Diamond topology
        const processed = new Set<string>();

        while (queue.length > 0) {
            const currentNode = queue.shift()!;
            if (processed.has(currentNode.id)) continue;

            const nodeTypeInst = this.nodeTypes.get(currentNode.type);
            if (!nodeTypeInst) {
                throw new Error(`Node type ${currentNode.type} not found in registry`);
            }

            const context = this.buildContext(currentNode, stateTracker, triggerData);

            try {
                const output = await nodeTypeInst.execute(context);
                stateTracker.saveStep(currentNode.id, output, 'SUCCESS');
                processed.add(currentNode.id);

                const children = this.getReadyChildren(currentNode.id, stateTracker);
                queue.push(...children);

            } catch (err: any) {
                if (currentNode.continueOnFail) {
                    stateTracker.saveStep(currentNode.id, [[{ json: { error: err.message } }]], 'WARNING');
                    processed.add(currentNode.id);
                    queue.push(...this.getReadyChildren(currentNode.id, stateTracker));
                } else {
                    throw err;
                }
            }
        }
    }
}
