
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { useState } from 'react';
import type { UserPreferences } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowRight, Wallet, Archive, Info, Link as LinkIcon, Users, Mail, TreeDeciduous, Book } from 'lucide-react';

export default function DashboardPage() {
  const { preferences, savePreferences, referenceImages } = useAppContext();
  const { toast } = useToast();
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  const handleSave = () => {
    savePreferences(localPreferences);
    toast({
      title: 'Preferences Saved',
      description: 'Your settings have been updated successfully.',
      variant: 'default',
    });
  };

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...localPreferences.focusTopics];
    newTopics[index] = value;
    setLocalPreferences({ ...localPreferences, focusTopics: newTopics });
  };
  
  const handleBacklinkChange = (index: number, value: string) => {
    const newBacklinks = [...localPreferences.backlinkUrls];
    newBacklinks[index] = value;
    setLocalPreferences({ ...localPreferences, backlinkUrls: newBacklinks });
  };

  const imagePreviews = referenceImages.slice(0, 4);

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

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">50</div>
                    <p className="text-xs text-muted-foreground">credits remaining this month</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Top-up Credits</Button>
                </CardFooter>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
            <CardDescription>Set your focus topics and desired backlinks for AI generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <Label className="font-semibold">Focus Topics</Label>
                    {localPreferences.focusTopics.map((topic, index) => (
                        <Input key={index} value={topic} onChange={(e) => handleTopicChange(index, e.target.value)} placeholder={`Topic #${index + 1}`} />
                    ))}
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Label className="font-semibold">Backlink URLs</Label>
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
                    </div>
                    {localPreferences.backlinkUrls.map((url, index) => (
                        <Input key={index} value={url} onChange={(e) => handleBacklinkChange(index, e.target.value)} placeholder={`URL #${index + 1}`} />
                    ))}
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Preferences</Button>
          </CardFooter>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Reference Image Library</CardTitle>
                    <CardDescription>A preview of your most recent images.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/image-archive">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((image) => (
                            <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border">
                                <Image
                                    src={image.imageUrl}
                                    alt={image.description}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={image.imageHint}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <Archive className="w-10 h-10 mb-4" />
                        <p>Your image archive is empty.</p>
                        <Button asChild variant="link">
                            <Link href="/image-archive">Upload your first image</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
            <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                    Jump right into the action and get the latest headlines to generate your next content pack.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="secondary" size="lg" className="w-full md:w-auto">
                    <Link href="/headlines">Fetch Latest Headlines <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardContent>
        </Card>

      </main>
    </>
  );
}
