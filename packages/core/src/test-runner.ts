import { ExecutionEngine, StateTracker, INodeType, INodeContext, IItem, IWorkflowNode, IWorkflowConnection } from './index';

// A mock node that just logs and passes data forward
class PrintNode implements INodeType {
    description = { name: 'Print Node', icon: '', properties: [] };

    async execute(context: INodeContext): Promise<IItem[][]> {
        const input = context.getInputData();
        const prefix = context.getNodeParameter('prefix', 0, 'LOG:');

        console.log(`${prefix}`, JSON.stringify(input));

        // Pass the input forward unmodified
        return [input];
    }
}

// A mock node that adds a property
class TransformNode implements INodeType {
    description = { name: 'Transform Node', icon: '', properties: [] };

    async execute(context: INodeContext): Promise<IItem[][]> {
        const input = context.getInputData();
        const addField = context.getNodeParameter('addField', 0, 'transformed');

        const output = input.map(item => ({
            json: { ...item.json, [addField]: true }
        }));

        return [output];
    }
}

async function runTest() {
    const registry = new Map<string, INodeType>();
    registry.set('print', new PrintNode());
    registry.set('transform', new TransformNode());

    const nodes: IWorkflowNode[] = [
        { id: '1', name: 'Start Http Webhook', type: 'print', parameters: { prefix: 'Started with:' } },
        { id: '2', name: 'Add Data', type: 'transform', parameters: { addField: 'systemVerified' } },
        { id: '3', name: 'Final Log', type: 'print', parameters: { prefix: 'Ended with:' } }
    ];

    const connections: IWorkflowConnection[] = [
        { source: '1', target: '2', sourceOutputIndex: 0, targetInputIndex: 0 },
        { source: '2', target: '3', sourceOutputIndex: 0, targetInputIndex: 0 }
    ];

    const engine = new ExecutionEngine(nodes, connections, registry);
    const state = new StateTracker();

    console.log('--- Starting mock DAG Execution ---');
    await engine.run({ initialData: 'Hello World' }, state);
    console.log('--- Finished mock DAG Execution ---');
}

runTest().catch(console.error);
