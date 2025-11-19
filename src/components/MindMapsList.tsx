import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Network, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MindMap {
  id: string;
  title: string;
  nodes: any;
  edges: any;
  created_at: string;
  updated_at: string;
}

export function MindMapsList({ readonly = false }: { readonly?: boolean }) {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMindMaps();
    subscribeToMindMaps();
  }, []);

  const fetchMindMaps = async () => {
    const { data, error } = await supabase
      .from('mind_maps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mind maps:', error);
      return;
    }

    setMindMaps(data || []);
  };

  const subscribeToMindMaps = () => {
    const channel = supabase
      .channel('mindmaps-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mind_maps',
        },
        () => {
          fetchMindMaps();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const deleteMindMap = async (id: string) => {
    const { error } = await supabase.from('mind_maps').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete mind map');
      return;
    }

    toast.success('Mind map deleted');
  };

  if (mindMaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Network className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No mind maps available yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mindMaps.map((mindMap) => (
        <Card key={mindMap.id} className="p-4 transition-shadow hover:shadow-md">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{mindMap.title}</h3>
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {Array.isArray(mindMap.nodes) ? mindMap.nodes.length : 0} nodes • Updated {new Date(mindMap.updated_at).toLocaleDateString()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/mindmaps/${mindMap.id}`)}
            >
              {readonly ? <Eye className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {readonly ? 'View' : 'Edit'}
            </Button>
            {!readonly && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMindMap(mindMap.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
