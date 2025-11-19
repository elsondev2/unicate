import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, X } from 'lucide-react';

const tips = [
  "💡 Swipe from the left edge to open the sidebar on mobile!",
  "💡 Tap any mind map node to edit its label quickly.",
  "💡 Use the search feature to find notes, mind maps, and audio lessons.",
  "💡 Teachers can upload audio lessons from the sidebar menu.",
  "💡 All your content is automatically saved to the cloud.",
  "💡 Switch between light and dark themes in the sidebar.",
  "💡 View the Community tab to see all teachers and students.",
  "💡 You can only edit content that you created.",
  "💡 Pinch to zoom on mind maps for better navigation.",
  "💡 Create rich text notes with formatting, images, and links.",
];

export function LoginTip() {
  const [tip, setTip] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen a tip today
    const lastTipDate = localStorage.getItem('lastTipDate');
    const today = new Date().toDateString();

    if (lastTipDate !== today) {
      // Show a random tip
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setTip(randomTip);
      setShow(true);
      localStorage.setItem('lastTipDate', today);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Tip of the Day</h4>
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => setShow(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
