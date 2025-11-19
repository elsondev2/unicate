import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Network, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as services from '@/lib/services';

interface MindMap {
  _id: string;
  title: string;
  nodes: unknown;
  edges: unknown;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function MindMapsList({ readonly = false }: { readonly?: boolean }) {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMindMaps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMindMaps = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await services.getMindMaps(user._id.toString());
      setMindMaps(data as unknown as MindMap[]);
    } catch (error) {
      console.error('Error fetching mind maps:', error);
      toast.error('Failed to fetch mind maps');
    } finally {
      setLoading(false);
    }
  };

  const deleteMindMap = async (id: string) => {
    if (!user) return;
    
    try {
      await services.deleteMindMap(id, user._id.toString());
      toast.success('Mind map deleted');
      fetchMindMaps();
    } catch (error) {
      toast.error('Failed to delete mind map');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading mind maps...</p>
      </div>
    );
  }

  if (mindMaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Network className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No mind maps available yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {mindMaps.map((mindMap) => {
        const isOwner = user && mindMap.user_id === user._id.toString();
        const canEdit = !readonly && isOwner;
        
        return (
          <Card key={mindMap._id} className="p-4 transition-shadow hover:shadow-md cursor-pointer group" onClick={() => navigate(`/mindmaps/${mindMap._id}`)}>
            <div className="mb-3 flex items-start gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors flex-shrink-0">
                <Network className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">{mindMap.title}</h3>
              </div>
            </div>
            <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
              {!isOwner && <span className="text-primary font-medium">By: {(mindMap as any).user_name || 'Unknown'} • </span>}
              {Array.isArray(mindMap.nodes) ? mindMap.nodes.length : 0} nodes • Updated {new Date(mindMap.updated_at).toLocaleDateString()}
              {!isOwner && <span className="ml-2 text-primary">• Shared</span>}
            </p>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => navigate(`/mindmaps/${mindMap._id}`)}
              >
                {canEdit ? <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="hidden xs:inline">{canEdit ? 'Edit' : 'View'}</span>
              </Button>
              {canEdit && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMindMap(mindMap._id)}
                  className="px-2 sm:px-3"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
