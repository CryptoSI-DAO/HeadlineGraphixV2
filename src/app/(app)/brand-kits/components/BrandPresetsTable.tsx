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
  <>
    {/* Desktop: Table */}
    <Card className="hidden md:block">
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

    {/* Mobile: Cards */}
    <div className="md:hidden space-y-3">
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : (
        presets.map(preset =>
          preset.name ? (
            <Card key={preset.id}>
              <CardContent className="p-4 space-y-3">
                {/* Header row: logo + name + actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {preset.logoUrl ? (
                      <Image
                        src={preset.logoUrl}
                        alt={preset.logoAlt || preset.name}
                        width={40}
                        height={40}
                        className="rounded-md bg-muted shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs shrink-0">
                        N/A
                      </div>
                    )}
                    <h3 className="font-semibold text-sm truncate">{preset.name}</h3>
                  </div>
                </div>

                {/* Color swatches */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md border shrink-0" style={{ backgroundColor: preset.primaryColor }} />
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md border shrink-0" style={{ backgroundColor: preset.secondaryColor }} />
                    <span className="text-xs text-muted-foreground">Secondary</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md border shrink-0" style={{ backgroundColor: preset.trimColor }} />
                    <span className="text-xs text-muted-foreground">Trim</span>
                  </div>
                </div>

                {/* Font + Art Style */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span><span className="font-medium text-foreground">Font:</span> {preset.font || '—'}</span>
                  <span><span className="font-medium text-foreground">Art:</span> {preset.artStyle || '—'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(preset)}>
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
              </CardContent>
            </Card>
          ) : (
            <Card key={preset.id} className="opacity-50">
              <CardContent className="p-4 text-center text-muted-foreground italic text-sm">
                Empty Slot
              </CardContent>
            </Card>
          )
        )
      )}
    </div>
  </>
);
