import { INodeType, INodeContext, IItem } from '@my8m/core';
import vm from 'vm';

export class CodeNode implements INodeType {
    public description = {
        name: 'Code',
        icon: 'fa-code',
        properties: [
            { name: 'javascript', type: 'string', required: true }
        ]
    };

    async execute(context: INodeContext): Promise<IItem[][]> {
        const items = context.getInputData();
        const jsCode = context.getNodeParameter('javascript', 0, 'return $input;');

        const returnData: IItem[] = [];

        const mappedItems = items.map(i => i.json);
        // Provide a sandboxed environment for the code
        const sandboxContext = {
            $input: mappedItems,
            items: mappedItems, // Alias for easier JS writing
            $env: {}, // Add safe env vars if needed
            console: {
                log: (...args: any[]) => context.log(args.join(' ')),
            }
        };

        vm.createContext(sandboxContext);

        try {
            // Execute arbitrary user JS. Since vm doesn't strictly prevent infinite loops on its own without timeouts:
            const codeString = `
            (function() {
                ${jsCode}
            })()
        `;
            console.log("[CodeNode] Attempting to compile script:\n", codeString);
            const script = new vm.Script(codeString);

            let result = script.runInContext(sandboxContext, {
                timeout: 5000 // Force halt if the script exceeds 5 seconds
            });

            // Ensure proper output formatting
            if (!Array.isArray(result)) {
                result = [result];
            }

            for (const item of result) {
                returnData.push({ json: item });
            }

        } catch (error: any) {
            if (context.continueOnFail()) {
                returnData.push({ json: { error: error.message } });
            } else {
                throw new Error(`CodeNode Execution Error: ${error.message}`);
            }
        }

        return [returnData];
    }
}
