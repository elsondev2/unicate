import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Minus,
  Maximize2,
  Download,
  Undo,
  Redo,
  Square,
  Circle,
  Hexagon,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MindMapToolbarProps {
  onAddNode: () => void;
  onDeleteNode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (format: 'png' | 'jpg' | 'svg') => void;
  selectedNodeColor?: string;
  onColorChange: (color: string) => void;
  selectedNodeShape?: string;
  onShapeChange: (shape: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onConnectionStyleChange?: (style: string) => void;
  connectionStyle?: string;
  onHandlePositionChange?: (position: string) => void;
  handlePosition?: string;
}

export function MindMapToolbar({
  onAddNode,
  onDeleteNode,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onExport,
  selectedNodeColor = '#3b82f6',
  onColorChange,
  selectedNodeShape = 'default',
  onShapeChange,
  canUndo,
  canRedo,
  onConnectionStyleChange,
  connectionStyle = 'curved',
  onHandlePositionChange,
  handlePosition = 'all',
}: MindMapToolbarProps) {
  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  return (
    <div className="border-b bg-card/80 backdrop-blur-sm p-2 md:p-3 overflow-x-auto">
      <div className="flex flex-nowrap gap-2 items-center min-w-max">
        {/* Node Actions */}
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onAddNode} title="Add Node">
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Add</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onDeleteNode} title="Delete Node">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Node Styling */}
        <div className="flex gap-2 items-center">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Color:</span>
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                className="h-5 w-5 md:h-6 md:w-6 rounded-full border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color.value,
                  borderColor: selectedNodeColor === color.value ? '#000' : 'transparent',
                }}
                onClick={() => onColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Node Shape */}
        <div className="flex gap-2 items-center">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Shape:</span>
          <Select value={selectedNodeShape} onValueChange={onShapeChange}>
            <SelectTrigger className="w-24 md:w-32 h-8 text-xs md:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Rectangle</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Connection Style */}
        {onConnectionStyleChange && (
          <>
            <div className="flex gap-2 items-center">
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Lines:</span>
              <Select value={connectionStyle} onValueChange={onConnectionStyleChange}>
                <SelectTrigger className="w-24 md:w-32 h-8 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curved">Curved</SelectItem>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="sharp">Sharp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Handle Position */}
        {onHandlePositionChange && (
          <>
            <div className="flex gap-2 items-center">
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Attach:</span>
              <Select value={handlePosition} onValueChange={onHandlePositionChange}>
                <SelectTrigger className="w-20 md:w-28 h-8 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sides</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Export - Hidden on mobile */}
        <div className="hidden lg:flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('png')}
            title="Export as PNG"
          >
            <Download className="h-4 w-4 mr-1" />
            PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
