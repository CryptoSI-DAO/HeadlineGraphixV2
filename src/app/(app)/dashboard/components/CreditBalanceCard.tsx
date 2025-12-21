import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export const CreditBalanceCard = () => (
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
);
