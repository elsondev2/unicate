import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Save, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as services from '@/lib/services';

export default function MindMapEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [title, setTitle] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [saving, setSaving] = useState(false);
  const [mapOwnerId, setMapOwnerId] = useState<string | null>(null);
  
  // Node editing state
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeColor, setNodeColor] = useState('#6366f1');
  const [showNodeDialog, setShowNodeDialog] = useState(false);

  const nodeColors = [
    { name: 'Primary', value: '#6366f1' },
    { name: 'Green', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
  ];

  useEffect(() => {
    if (id && id !== 'new' && user) {
      fetchMindMap();
    } else if (id === 'new') {
      // Initialize with a default node for new maps
      setNodes([
        {
          id: '1',
          type: 'default',
          position: { x: 250, y: 100 },
          data: { label: 'Main Topic' },
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

  const isOwner = user && (id === 'new' || mapOwnerId === user._id.toString());
  const isTeacher = userRole === 'TEACHER';
  const canEdit = isOwner && isTeacher;

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (canEdit) {
        setNodes((nds) => applyNodeChanges(changes, nds));
      }
    },
    [canEdit]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (canEdit) {
        setEdges((eds) => applyEdgeChanges(changes, eds));
      }
    },
    [canEdit]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (canEdit) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [canEdit]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      if (canEdit) {
        setEditingNode(node);
        setNodeLabel(node.data.label as string || '');
        setNodeColor(node.style?.backgroundColor as string || '#6366f1');
        setShowNodeDialog(true);
      }
    },
    [canEdit]
  );

  const handleAddNode = () => {
    if (!canEdit) {
      toast.error('You do not have permission to edit this mind map');
      return;
    }

    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: { label: 'New Node' },
      style: {
        backgroundColor: '#6366f1',
        color: '#ffffff',
        border: '2px solid #4f46e5',
        borderRadius: '8px',
        padding: '10px',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    toast.success('Node added! Tap to edit');
  };

  const handleUpdateNode = () => {
    if (!editingNode || !nodeLabel.trim()) {
      toast.error('Please enter a label');
      return;
    }

    setNodes((nds) =>
      nds.map((node) =>
        node.id === editingNode.id
          ? {
              ...node,
              data: { ...node.data, label: nodeLabel },
              style: {
                ...node.style,
                backgroundColor: nodeColor,
                color: '#ffffff',
                border: `2px solid ${nodeColor}`,
                borderRadius: '8px',
                padding: '10px',
              },
            }
          : node
      )
    );

    setShowNodeDialog(false);
    setEditingNode(null);
    setNodeLabel('');
    setNodeColor('#6366f1');
    toast.success('Node updated');
  };

  const handleDeleteNode = () => {
    if (!editingNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== editingNode.id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== editingNode.id && edge.target !== editingNode.id)
    );

    setShowNodeDialog(false);
    setEditingNode(null);
    setNodeLabel('');
    setNodeColor('#6366f1');
    toast.success('Node deleted');
  };

  const handleSave = async () => {
    if (!user) return;

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!canEdit) {
      toast.error('You do not have permission to save this mind map');
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
      console.error('Save error:', error);
      toast.error('Failed to save mind map');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b bg-card p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Back</span>
            </Button>
            {!canEdit && (
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 sm:px-3 py-1 sm:py-1.5 rounded-md">
                View Only
              </div>
            )}
            {canEdit && (
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="mr-1 sm:mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mind map title..."
            className="text-base sm:text-lg font-semibold"
            disabled={!canEdit}
          />

          {canEdit && (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleAddNode} size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add Node
              </Button>
              <div className="text-xs text-muted-foreground flex items-center">
                <LinkIcon className="mr-1 h-3 w-3" />
                Tap nodes to edit • Drag to connect
              </div>
            </div>
          )}
        </div>

        {/* Mind Map Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            nodesDraggable={canEdit}
            nodesConnectable={canEdit}
            elementsSelectable={canEdit}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Controls showInteractive={canEdit} />
            <MiniMap className="hidden sm:block" />
            <Background />
          </ReactFlow>
        </div>

        {/* Node Edit Dialog */}
        <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                Edit Node
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="node-label">Node Label</Label>
                <Input
                  id="node-label"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  placeholder="Enter node label..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateNode();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Node Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {nodeColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNodeColor(color.value)}
                      className={`h-10 rounded-md border-2 transition-all ${
                        nodeColor === color.value
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteNode}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowNodeDialog(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateNode} className="flex-1 sm:flex-none">
                  Update
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
