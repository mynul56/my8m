import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';

interface RFState {
    nodes: Node[];
    edges: Edge[];
    availableNodes: any[];
    setAvailableNodes: (nodes: any[]) => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    addNode: (node: Node) => void;
    updateNodeData: (nodeId: string, data: any) => void;
    setNodes: (nodes: Node[]) => void;
}

const useStore = create<RFState>((set, get) => ({
    nodes: [],
    edges: [],
    availableNodes: [],
    setAvailableNodes: (nodes) => set({ availableNodes: nodes }),
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    addNode: (node: Node) => {
        set({
            nodes: [...get().nodes, node],
        });
    },
    updateNodeData: (nodeId: string, data: any) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            }),
        });
    },
    setNodes: (nodes: Node[]) => {
        set({ nodes });
    }
}));

export default useStore;
