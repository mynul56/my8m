import { INodeType, INodeContext, IItem } from '@my8m/core';

export class MergeNode implements INodeType {
    description = {
        name: 'Merge',
        icon: 'fa-compress-arrows-alt',
        properties: [],
    };

    async execute(context: INodeContext): Promise<IItem[][]> {
        // The BFS DAG Runner naturally passes input from upstream nodes. 
        // A visual Merge node acts as a pass-through anchor to join visual lines.
        return [context.getInputData()];
    }
}
