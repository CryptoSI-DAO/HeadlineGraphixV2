import { Info, Link as LinkIcon, Users, Mail, TreeDeciduous, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const backlinkSuggestions = [
  {
    icon: LinkIcon,
    title: 'Your Website',
    description: 'The primary homepage of your business or personal brand.',
  },
  {
    icon: Users,
    title: 'Social Media',
    description: 'Link to your main profile (e.g., LinkedIn, Twitter/X, Instagram).',
  },
  {
    icon: Mail,
    title: 'Mailing List',
    description: 'Your newsletter sign-up page to grow your audience.',
  },
  {
    icon: TreeDeciduous,
    title: 'Linktree / Bio Link',
    description: 'A single link that houses all your important URLs.',
  },
  {
    icon: Book,
    title: 'Key Content Piece',
    description: 'A high-value blog post, landing page, or free resource.',
  },
];

export const BacklinkSuggestionsDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
        <Info className="h-4 w-4" />
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Backlink URL Suggestions</DialogTitle>
        <DialogDescription>
          Here are 5 ideas for sites you could add to your backlinks to help the AI.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        {backlinkSuggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <suggestion.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{suggestion.title}</p>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
