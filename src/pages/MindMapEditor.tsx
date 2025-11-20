import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, addEdge, Connection, ConnectionLineType, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import * as services from '@/lib/services';
import { MindMapToolbar } from '@/components/MindMapToolbar';
import { CustomNode } from '@/components/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

export default function MindMapEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [saving, setSaving] = useState(false);
  const [mapOwnerId, setMapOwnerId] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [connectionLineType, setConnectionLineType] = useState<ConnectionLineType>(ConnectionLineType.Bezier);
  const [nodeColor, setNodeColor] = useState('#3b82f6');
  const [nodeShape, setNodeShape] = useState('default');
  const [handlePosition, setHandlePosition] = useState('all');

  useEffect(() => {
    if (id && id !== 'new' && user) {
      fetchMindMap();
    } else {
      setNodes([
        { 
          id: '1', 
          type: 'custom',
          position: { x: 250, y: 100 }, 
          data: { label: 'Main Topic', color: '#3b82f6', shape: 'default', handlePosition: 'all' } 
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchMindMap = async () => {
    if (!user || !id) return;
    
    try {
      const data = await services.getMindMap(id, user._id.toString());
      if (data) {
        setTitle(data.title);
        setMapOwnerId(data.user_id);
        const nodesData = data.nodes as unknown;
        const edgesData = data.edges as unknown;
        setNodes(Array.isArray(nodesData) ? nodesData : []);
        setEdges(Array.isArray(edgesData) ? edgesData : []);
      }
    } catch (error) {
      console.error('Error fetching mind map:', error);
      toast.error('Failed to load mind map');
    }
  };

  const onConnect = useCallback((params: Connection) => {
    const newEdge = {
      ...params,
      type: connectionLineType === ConnectionLineType.Bezier ? 'default' : 
            connectionLineType === ConnectionLineType.Straight ? 'straight' : 'step',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [connectionLineType]);

  const handleAddNode = () => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'custom',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: { 
        label: 'New Node',
        color: nodeColor,
        shape: nodeShape,
        handlePosition: handlePosition,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleDeleteNode = () => {
    if (selectedNodes.length === 0) {
      toast.error('Please select a node to delete');
      return;
    }
    setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
    setEdges((eds) => eds.filter((edge) => 
      !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
    ));
    setSelectedNodes([]);
  };

  const handleColorChange = (color: string) => {
    setNodeColor(color);
    if (selectedNodes.length > 0) {
      setNodes((nds) =>
        nds.map((node) =>
          selectedNodes.includes(node.id)
            ? { ...node, data: { ...node.data, color } }
            : node
        )
      );
    }
  };

  const handleShapeChange = (shape: string) => {
    setNodeShape(shape);
    if (selectedNodes.length > 0) {
      setNodes((nds) =>
        nds.map((node) =>
          selectedNodes.includes(node.id)
            ? { ...node, data: { ...node.data, shape } }
            : node
        )
      );
    }
  };

  const handleConnectionStyleChange = (style: string) => {
    const lineType = style === 'curved' ? ConnectionLineType.Bezier :
                     style === 'straight' ? ConnectionLineType.Straight :
                     ConnectionLineType.Step;
    setConnectionLineType(lineType);
    
    // Update existing edges
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        type: style === 'curved' ? 'default' : 
              style === 'straight' ? 'straight' : 'step',
      }))
    );
  };

  const handleHandlePositionChange = (position: string) => {
    setHandlePosition(position);
    if (selectedNodes.length > 0) {
      setNodes((nds) =>
        nds.map((node) =>
          selectedNodes.includes(node.id)
            ? { ...node, data: { ...node.data, handlePosition: position } }
            : node
        )
      );
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      if (id === 'new') {
        await services.createMindMap(user._id.toString(), title, nodes, edges);
      } else {
        await services.updateMindMap(id!, user._id.toString(), title, nodes, edges);
      }
      toast.success('Mind map saved!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isOwner = user && mapOwnerId === user._id.toString();
  const readonly = id !== 'new' && !isOwner;

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b bg-card p-2 md:p-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-2 md:gap-0 md:justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="self-start md:self-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mind map title..."
            className="w-full md:mx-4 md:max-w-md"
            disabled={readonly}
          />
          {!readonly && (
            <Button onClick={handleSave} disabled={saving} size="sm" className="self-end md:self-auto">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
          {readonly && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md self-end md:self-auto">
              View Only
            </div>
          )}
        </div>
      </div>
      
      {!readonly && (
        <MindMapToolbar
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onFitView={() => {}}
          onUndo={() => {}}
          onRedo={() => {}}
          onExport={() => {}}
          selectedNodeColor={nodeColor}
          onColorChange={handleColorChange}
          selectedNodeShape={nodeShape}
          onShapeChange={handleShapeChange}
          canUndo={false}
          canRedo={false}
          onConnectionStyleChange={handleConnectionStyleChange}
          connectionStyle={
            connectionLineType === ConnectionLineType.Bezier ? 'curved' :
            connectionLineType === ConnectionLineType.Straight ? 'straight' : 'sharp'
          }
          onHandlePositionChange={handleHandlePositionChange}
          handlePosition={handlePosition}
        />
      )}
      
      <div className="flex-1 touch-none">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={(changes) => {
            if (!readonly) {
              setNodes((nds) => {
                return nds.map((node) => {
                  const change = changes.find((c) => 'id' in c && c.id === node.id);
                  if (change && 'type' in change && change.type === 'position' && 'position' in change && change.position) {
                    return { ...node, position: change.position };
                  }
                  if (change && 'type' in change && change.type === 'select' && 'selected' in change) {
                    return { ...node, selected: change.selected };
                  }
                  return node;
                });
              });
            }
          }}
          onEdgesChange={(changes) => {
            if (!readonly) {
              setEdges((eds) => {
                return eds.filter((edge) => {
                  const removeChange = changes.find((c) => 'id' in c && c.id === edge.id && 'type' in c && c.type === 'remove');
                  return !removeChange;
                });
              });
            }
          }}
          onConnect={onConnect}
          onSelectionChange={(params) => {
            setSelectedNodes(params.nodes.map((n) => n.id));
          }}
          connectionLineType={connectionLineType}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
          }}
          fitView
          minZoom={0.1}
          maxZoom={4}
          panOnScroll
          panOnDrag
          zoomOnPinch
          zoomOnDoubleClick={false}
        >
          <Controls className="bg-card border rounded-lg shadow-lg" />
          <MiniMap 
            className="bg-card border rounded-lg shadow-lg"
            nodeColor={(node) => {
              const color = node.data?.color as string;
              return color || '#3b82f6';
            }}
          />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
