import useStore from '../store/useStore';

export const PropertiesSidebar = () => {
    const { nodes, updateNodeData, availableNodes } = useStore();

    // Find the selected node
    const selectedNode = nodes.find(n => n.selected);

    if (!selectedNode) {
        return (
            <div style={{ padding: '16px', color: '#aaa', fontSize: '14px' }}>
                Select a node on the canvas to configure its properties.
            </div>
        );
    }

    // Find the schema for this node type
    const schema = availableNodes.find(n => n.name === selectedNode.data.type) || { properties: [] };

    const handleInputChange = (propName: string, value: string) => {
        updateNodeData(selectedNode.id, { [propName]: value });
    };

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, borderBottom: '1px solid #444', paddingBottom: '8px' }}>
                {selectedNode.data.type} Properties
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#ccc' }}>Node Label</label>
                <input
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff' }}
                    value={selectedNode.data.label || ''}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                />
            </div>

            {schema.properties.map((prop: any) => (
                <div key={prop.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#ccc' }}>
                        {prop.name} {prop.required && <span style={{ color: '#e74c3c' }}>*</span>}
                    </label>

                    {prop.type === 'options' ? (
                        <select
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff' }}
                            value={selectedNode.data[prop.name] || ''}
                            onChange={(e) => handleInputChange(prop.name, e.target.value)}
                        >
                            <option value="">Select an option...</option>
                            {prop.options.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff' }}
                            value={selectedNode.data[prop.name] || ''}
                            onChange={(e) => handleInputChange(prop.name, e.target.value)}
                            placeholder={`Enter ${prop.name}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
