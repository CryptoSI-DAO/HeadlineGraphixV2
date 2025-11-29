'use client';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

type BrandPreset = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  trimColor: string;
  font: string;
  artStyle: string;
  logoUrl: string;
  logoAlt: string;
};

const mockBrandPresets: BrandPreset[] = [
  {
    id: '1',
    name: 'Afroball connect',
    primaryColor: '#F44336',
    secondaryColor: '#121212',
    trimColor: '#FFD700',
    font: 'Montserrat',
    artStyle: 'Afro-Futuristic Minimalism',
    logoUrl: 'https://picsum.photos/seed/afroball/40/40',
    logoAlt: 'Afroball connect logo',
  },
  {
    id: '2',
    name: 'Lex Consulting',
    primaryColor: '#708090',
    secondaryColor: '#F8F8F8',
    trimColor: '#007BFF',
    font: 'Cinzel',
    artStyle: 'Geometric',
    logoUrl: 'https://picsum.photos/seed/lex/40/40',
    logoAlt: 'Lex Consulting logo',
  },
  {
    id: '3',
    name: 'Crypto Waffle',
    primaryColor: '#43C4CC',
    secondaryColor: '#FFD878',
    trimColor: '#2A2B2D',
    font: 'Fredoka',
    artStyle: 'Cartoon',
    logoUrl: 'https://picsum.photos/seed/waffle/40/40',
    logoAlt: 'Crypto Waffle logo',
  },
];

const ColorSwatch = ({ color }: { color: string }) => (
  <div className="flex items-center gap-2">
    <div
      className="h-6 w-6 rounded-md border"
      style={{ backgroundColor: color }}
    />
    <span className="font-mono text-sm">{color.toUpperCase()}</span>
  </div>
);

export default function BrandKitsPage() {
  const presets = [...mockBrandPresets];
  while (presets.length < 10) {
    presets.push({
      id: `empty-${presets.length}`,
      name: '',
      primaryColor: '',
      secondaryColor: '',
      trimColor: '',
      font: '',
      artStyle: '',
      logoUrl: '',
      logoAlt: ''
    });
  }


  return (
    <>
      <Header title="Brand Presets">
        <Button>Add New Brand</Button>
      </Header>
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Secondary</TableHead>
                  <TableHead>Trim</TableHead>
                  <TableHead>Font</TableHead>
                  <TableHead>Art Style</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((preset) =>
                  preset.name ? (
                    <TableRow key={preset.id}>
                      <TableCell className="font-medium">{preset.name}</TableCell>
                      <TableCell>
                        <ColorSwatch color={preset.primaryColor} />
                      </TableCell>
                      <TableCell>
                        <ColorSwatch color={preset.secondaryColor} />
                      </TableCell>
                      <TableCell>
                        <ColorSwatch color={preset.trimColor} />
                      </TableCell>
                      <TableCell>{preset.font}</TableCell>
                      <TableCell>{preset.artStyle}</TableCell>
                      <TableCell>
                        <Image
                          src={preset.logoUrl}
                          alt={preset.logoAlt}
                          width={40}
                          height={40}
                          className="rounded-md bg-muted"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={preset.id}>
                      <TableCell colSpan={8} className="text-center text-muted-foreground h-16">
                        Empty Slot
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
