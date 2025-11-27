'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { useState } from 'react';
import type { UserPreferences } from '@/lib/types';
import { ArrowRight, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const { preferences, savePreferences } = useAppContext();
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
                    <Label className="font-semibold">Backlink URLs</Label>
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

        <Card className="bg-primary text-primary-foreground">
            <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                    Jump right into the action and get the latest headlines to generate your next content pack.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/headlines" passHref legacyBehavior>
                    <Button asChild variant="secondary" size="lg" className="w-full md:w-auto">
                        <a>Fetch Latest Headlines <ArrowRight className="ml-2 h-4 w-4" /></a>
                    </Button>
                </Link>
            </CardContent>
        </Card>

      </main>
    </>
  );
}
