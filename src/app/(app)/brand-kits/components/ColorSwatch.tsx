export const ColorSwatch = ({ color }: { color: string }) => (
  <div className="flex items-center gap-2">
    <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: color }} />
    <span className="font-mono text-sm">{color.toUpperCase()}</span>
  </div>
);
