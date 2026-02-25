export interface IItem {
  json: Record<string, any>;
  binary?: Record<string, any>;
}

export interface INodeContext {
  getInputData(nodeIndex?: number): IItem[];
  getCredentials(name: string): Promise<Record<string, any>>;
  continueOnFail(): boolean;
  log(message: string): void;
  getNodeParameter(paramName: string, itemIndex?: number, fallback?: any): any;
}

export interface INodeDescription {
  name: string;
  icon: string;
  properties: any[];
}

export interface INodeType {
  description: INodeDescription;
  execute(context: INodeContext): Promise<IItem[][]>;
}

// Simplified representation of a Workflow Version DAG
export interface IWorkflowNode {
  id: string; // instance id in the graph
  name: string; // Human readable name
  type: string; // The class name or reference
  parameters: Record<string, any>;
  continueOnFail?: boolean;
}

export interface IWorkflowConnection {
  source: string; // node id
  target: string; // node id
  sourceOutputIndex?: number;
  targetInputIndex?: number;
}
