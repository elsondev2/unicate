import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const shape = (data.shape as string) || 'default';
  const color = (data.color as string) || '#3b82f6';
  const textColor = (data.textColor as string) || '#ffffff';
  const label = (data.label as string) || 'Node';
  const handlePosition = (data.handlePosition as string) || 'all';

  const getShapeStyles = () => {
    const baseStyles = {
      padding: '12px 20px',
      border: `2px solid ${selected ? '#000' : color}`,
      backgroundColor: color,
      color: textColor,
      fontSize: '14px',
      fontWeight: '500',
      minWidth: '120px',
      textAlign: 'center' as const,
      cursor: 'grab',
      boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
    };

    switch (shape) {
      case 'circle':
        return {
          ...baseStyles,
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
        };
      case 'rounded':
        return {
          ...baseStyles,
          borderRadius: '20px',
        };
      case 'diamond':
        return {
          ...baseStyles,
          transform: 'rotate(45deg)',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      default:
        return {
          ...baseStyles,
          borderRadius: '8px',
        };
    }
  };

  const contentStyles = shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {};

  const renderHandles = () => {
    const handleStyle = { 
      background: '#fff', 
      border: `2px solid ${color}`,
      width: '14px', 
      height: '14px',
      transition: 'all 0.2s ease',
    };
    
    switch (handlePosition) {
      case 'left':
        return (
          <>
            <Handle type="target" position={Position.Left} style={handleStyle} />
            <Handle type="source" position={Position.Left} style={handleStyle} />
          </>
        );
      case 'right':
        return (
          <>
            <Handle type="target" position={Position.Right} style={handleStyle} />
            <Handle type="source" position={Position.Right} style={handleStyle} />
          </>
        );
      case 'top':
        return (
          <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <Handle type="source" position={Position.Top} style={handleStyle} />
          </>
        );
      case 'bottom':
        return (
          <>
            <Handle type="target" position={Position.Bottom} style={handleStyle} />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
          </>
        );
      default: // 'all'
        return (
          <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <Handle type="target" position={Position.Left} style={handleStyle} />
            <Handle type="target" position={Position.Right} style={handleStyle} />
            <Handle type="target" position={Position.Bottom} style={handleStyle} />
            <Handle type="source" position={Position.Top} style={handleStyle} />
            <Handle type="source" position={Position.Left} style={handleStyle} />
            <Handle type="source" position={Position.Right} style={handleStyle} />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
          </>
        );
    }
  };

  return (
    <div style={getShapeStyles()}>
      {renderHandles()}
      <div style={contentStyles}>
        <div contentEditable suppressContentEditableWarning>
          {label}
        </div>
      </div>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
