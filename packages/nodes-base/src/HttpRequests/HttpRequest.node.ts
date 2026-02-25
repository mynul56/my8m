import { INodeType, INodeContext, IItem } from '@my8m/core';
import axios from 'axios';

export class HttpRequestNode implements INodeType {
    public description = {
        name: 'HTTP Request',
        icon: 'fa-globe',
        properties: [
            { name: 'url', type: 'string', required: true },
            { name: 'method', type: 'options', options: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'authentication', type: 'resourceLocator' }
        ]
    };

    async execute(context: INodeContext): Promise<IItem[][]> {
        const items = context.getInputData();
        const returnData: IItem[] = [];

        // If there is no incoming data (it's a start node), we process once
        const iterations = items.length === 0 ? 1 : items.length;

        for (let i = 0; i < iterations; i++) {
            const url = context.getNodeParameter('url', i) as string;
            const method = context.getNodeParameter('method', i, 'GET') as string;

            const headers: Record<string, string> = {};
            const authName = context.getNodeParameter('authentication', i, null);

            if (authName) {
                // Fetch and decrypt credentials using the context
                const decryptedCreds = await context.getCredentials(authName);
                if (decryptedCreds?.token) {
                    headers['Authorization'] = `Bearer ${decryptedCreds.token}`;
                } else if (decryptedCreds?.username) {
                    const b64 = Buffer.from(`${decryptedCreds.username}:${decryptedCreds.password}`).toString('base64');
                    headers['Authorization'] = `Basic ${b64}`;
                }
            }

            try {
                const response = await axios({ method, url, headers });
                returnData.push({ json: response.data });
            } catch (error: any) {
                if (context.continueOnFail()) {
                    // If continue on fail is true, suppress the exception and output the error structure
                    returnData.push({ json: { error: error.message, status: error.response?.status } });
                } else {
                    // Halt execution and allow DAG Engine to catch it
                    throw error;
                }
            }
        }

        // Outputs flow to port 0
        return [returnData];
    }
}
