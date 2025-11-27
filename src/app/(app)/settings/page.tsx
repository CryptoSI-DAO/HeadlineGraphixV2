import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Settings Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is under construction. Check back later for options to manage your account, billing, and application settings.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
