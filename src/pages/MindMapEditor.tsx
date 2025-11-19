import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, addEdge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function MindMapEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [title, setTitle] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchMindMap();
    } else {
      setNodes([
        { id: '1', position: { x: 250, y: 100 }, data: { label: 'Main Topic' } },
      ]);
    }
  }, [id]);

  const fetchMindMap = async () => {
    const { data } = await supabase
      .from('mind_maps')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setTitle(data.title);
      // Cast Json to any, then validate and set as Node[]/Edge[]
      const nodesData = data.nodes as any;
      const edgesData = data.edges as any;
      setNodes(Array.isArray(nodesData) ? nodesData : []);
      setEdges(Array.isArray(edgesData) ? edgesData : []);
    }
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      if (id === 'new') {
        const { error } = await supabase.from('mind_maps').insert({
          title,
          nodes: nodes as any,
          edges: edges as any,
          teacher_id: user?.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mind_maps')
          .update({ 
            title, 
            nodes: nodes as any, 
            edges: edges as any 
          })
          .eq('id', id);
        if (error) throw error;
      }
      toast.success('Mind map saved!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const readonly = userRole === 'STUDENT';

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mind map title..."
            className="mx-4 max-w-md"
            disabled={readonly}
          />
          {!readonly && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            if (!readonly) {
              setNodes((nds) => {
                // Apply changes to nodes
                return nds.map((node) => {
                  const change = changes.find((c: any) => c.id === node.id);
                  if (change && change.type === 'position' && change.position) {
                    return { ...node, position: change.position };
                  }
                  return node;
                });
              });
            }
          }}
          onEdgesChange={(changes) => {
            if (!readonly) {
              setEdges((eds) => {
                // Filter out removed edges
                return eds.filter((edge) => {
                  const removeChange = changes.find((c: any) => c.id === edge.id && c.type === 'remove');
                  return !removeChange;
                });
              });
            }
          }}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
