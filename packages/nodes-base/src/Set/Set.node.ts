import { INodeType, INodeContext, IItem } from '@my8m/core';

export class SetNode implements INodeType {
    description = {
        name: 'Set',
        icon: 'fa-pen',
        properties: [
            {
                name: 'propertyName',
                type: 'string',
                description: 'The name of the parameter to set',
                required: true,
            },
            {
                name: 'propertyValue',
                type: 'string',
                description: 'The value to set',
                required: true,
            }
        ],
    };

    async execute(context: INodeContext): Promise<IItem[][]> {
        const items = context.getInputData();
        const returnData: IItem[] = [];

        // Support for empty 0-item starts (triggers)
        const iterations = items.length === 0 ? 1 : items.length;

        for (let i = 0; i < iterations; i++) {
            const propertyName = context.getNodeParameter('propertyName', i, '') as string;
            const propertyValue = context.getNodeParameter('propertyValue', i, '') as string;

            // Clone to avoid mutating original source state memory
            const currentItem = items[i];
            const json = currentItem ? { ...currentItem.json } : {};

            if (propertyName) {
                json[propertyName] = propertyValue;
            }

            returnData.push({ json });
        }

        return [returnData];
    }
}
