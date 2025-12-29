import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Avoid eval-based source maps which can choke on edge-case characters.
      config.devtool = 'source-map';
    }
    config.module = config.module ?? {};
    // Genkit pulls in OpenTelemetry which uses dynamic requires that webpack flags.
    config.module.exprContextCritical = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.cryptosi.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
