import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SheetsAPI',
    short_name: 'SheetsAPI',
    description: 'Google Sheets integration toolkit',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f1117',
    theme_color: '#22c55e',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity'],
    prefer_related_applications: false,
    related_applications: [
      {
        platform: 'play' as const,
        id: 'PLACEHOLDER_PACKAGE_NAME',
        url: 'https://play.google.com/store/apps/details?id=PLACEHOLDER_PACKAGE_NAME',
      },
    ],
  };
}
