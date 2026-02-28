import Image from 'next/image';
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
import { ColorSwatch } from './ColorSwatch';
import type { BrandPreset } from '../types';

export const BrandPresetsTable = ({
  presets,
  onEdit,
  onDelete,
  isLoading = false,
}: {
  presets: BrandPreset[];
  onEdit: (preset: BrandPreset) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}) => (
  <Card>
    <CardContent className="p-0">
      <Table className="min-w-[720px]">
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground h-16">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            presets.map(preset =>
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
                    {preset.logoUrl ? (
                      <Image
                        src={preset.logoUrl}
                        alt={preset.logoAlt}
                        width={40}
                        height={40}
                        className="rounded-md bg-muted"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No logo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(preset)}>
                        Edit
                      </Button>
                      {onDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(preset.id)}
                        >
                          Delete
                        </Button>
                      )}
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
            )
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
