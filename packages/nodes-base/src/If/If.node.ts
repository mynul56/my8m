import { INodeType, INodeContext, IItem } from '@my8m/core';

export class IfNode implements INodeType {
    description = {
        name: 'If',
        icon: 'fa-code-branch',
        properties: [
            {
                name: 'field',
                type: 'string',
                description: 'The property field to check on the incoming items',
                required: true,
            },
            {
                name: 'operator',
                type: 'options',
                options: ['==', '!=', '>', '<', 'contains'],
                description: 'The comparison operation',
                required: true,
            },
            {
                name: 'value',
                type: 'string',
                description: 'The value to compare against',
                required: true,
            }
        ],
    };

    async execute(context: INodeContext): Promise<IItem[][]> {
        const items = context.getInputData();

        const trueItems: IItem[] = [];
        const falseItems: IItem[] = [];

        for (let i = 0; i < items.length; i++) {
            const currentItem = items[i];
            if (!currentItem) continue;

            const field = context.getNodeParameter('field', i, '') as string;
            const operator = context.getNodeParameter('operator', i, '==') as string;
            const value = context.getNodeParameter('value', i, '') as string;

            const itemJson = currentItem.json;
            const actualValue = itemJson[field];

            let conditionMet = false;

            // Simple type coercion comparison for workflow engine simplicity
            switch (operator) {
                case '==':
                    conditionMet = String(actualValue) === String(value);
                    break;
                case '!=':
                    conditionMet = String(actualValue) !== String(value);
                    break;
                case '>':
                    conditionMet = Number(actualValue) > Number(value);
                    break;
                case '<':
                    conditionMet = Number(actualValue) < Number(value);
                    break;
                case 'contains':
                    conditionMet = String(actualValue).includes(String(value));
                    break;
            }

            if (conditionMet) {
                trueItems.push(currentItem);
            } else {
                falseItems.push(currentItem);
            }
        }

        // Return array of arrays: index 0 (port 0) = true, index 1 (port 1) = false
        return [trueItems, falseItems];
    }
}
