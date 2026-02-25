import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import useStore from './store/useStore';
import { GenericNode } from './components/GenericNode';
import axios from 'axios';

const nodeTypes = {
    genericNode: GenericNode,
};

const Flow = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore();
    const [availableNodes, setAvailableNodes] = useState<any[]>([]);

    useEffect(() => {
        // Fetch dynamic Node Registry from API Server
        axios.get('http://localhost:3000/api/nodes', {
            headers: {
                // Providing a mock auth header just to bypass the JWT middleware for testing purposes
                Authorization: 'Bearer mock_token_for_dev'
            }
        })
            .then(res => setAvailableNodes(res.data.data))
            .catch(console.error);
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current) return;
            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const nodeType = event.dataTransfer.getData('application/reactflow');
            const nodeLabel = event.dataTransfer.getData('application/label');

            if (typeof nodeType === 'undefined' || !nodeType) return;

            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };

            const newNode = {
                id: `dndnode_${Date.now()}`,
                type: 'genericNode',
                position,
                data: { label: nodeLabel, type: nodeType },
            };

            addNode(newNode);
        },
        [addNode]
    );

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#1e1e1e' }}>

            {/* Sidebar Component */}
            <div style={{ width: '250px', background: '#252526', borderRight: '1px solid #333', color: '#ccc', padding: '16px' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '8px' }}>Available Nodes</h3>
                <p style={{ fontSize: '12px', color: '#aaa' }}>Drag these into the canvas</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableNodes.map((n) => (
                        <div
                            key={n.name}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', n.name);
                                e.dataTransfer.setData('application/label', n.name);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            draggable
                            style={{
                                background: '#333333',
                                padding: '10px',
                                borderRadius: '6px',
                                cursor: 'grab',
                                border: '1px solid #444',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>🔗</span>
                            {n.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* React Flow Canvas Component */}
            <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background color="#555" gap={16} />
                        <Controls />
                        <MiniMap style={{ background: '#252526' }} nodeColor="#3498db" maskColor="rgba(0,0,0,0.5)" />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

        </div>
    );
};

export default Flow;
