import {
  RectangleHorizontal,
  RectangleVertical,
  Square as SquareIcon,
} from 'lucide-react';

export const brandTones = ['Momentum Inc.'];

export const imageSizeOptions = [
  {
    id: 'square',
    icon: SquareIcon,
    label: 'Square',
    dims: '1024x1024',
    desc: 'Best for FB, IG, LinkedIn',
  },
  {
    id: 'landscape',
    icon: RectangleHorizontal,
    label: 'Landscape',
    dims: '1536x1024',
    desc: 'Best for Twitter, Banners',
  },
  {
    id: 'portrait',
    icon: RectangleVertical,
    label: 'Portrait',
    dims: '1024x1536',
    desc: 'Best for Pinterest, Stories',
  },
];
