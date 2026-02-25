import { Handle, Position, NodeProps } from 'reactflow';

// Enhanced custom node logic mirroring n8n styling
export const GenericNode = ({ data, isConnectable }: NodeProps) => {
    return (
        <div style={{
            background: '#2c3e50',
            color: 'white',
            borderRadius: '8px',
            padding: '10px',
            border: '1px solid #34495e',
            minWidth: '150px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            {/* Target Handle (Input) */}
            <Handle
                type="target"
                position={Position.Left}
                id="a"
                style={{ background: '#3498db', width: '12px', height: '12px' }}
                isConnectable={isConnectable}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <span>{data.label}</span>
            </div>

            <div style={{ fontSize: '10px', color: '#bdc3c7' }}>
                {data.type || 'Action Node'}
            </div>

            {/* Source Handle (Output) */}
            <Handle
                type="source"
                position={Position.Right}
                id="b"
                style={{ background: '#2ecc71', width: '12px', height: '12px' }}
                isConnectable={isConnectable}
            />
        </div>
    );
};
