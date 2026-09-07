// Shared photo mood across the whole site:
// warm, slightly desaturated highlights, teal-leaning shadows.
// Match this grading when adding new images.

export const LANDING_MEDIA = {
  heroMode: 'carousel\' as \'video\' | \'carousel',
  heroVideo: '/assets/landing/hero-video.mp4',
  heroPoster: '/assets/landing/hero-poster.jpg',
  heroCarousel: [
    '/assets/landing/hero-images/slide-1.jpg',
    '/assets/landing/hero-images/slide-2.jpg',
    '/assets/landing/hero-images/slide-3.jpg',
  ],
  howItWorks: [
    '/assets/landing/how-it-works/step-1-location.jpg',
    '/assets/landing/how-it-works/step-2-business.jpg',
    '/assets/landing/how-it-works/step-3-report.jpg',
  ],
};

export const CATEGORY_PHOTOS: Record<string, string> = {
  DAIRY: '/assets/categories/dairy.jpg',
  FOOD_PROCESSING: '/assets/categories/food-processing.jpg',
  RETAIL: '/assets/categories/retail.jpg',
  TEXTILES_TAILORING: '/assets/categories/textiles-tailoring.jpg',
  POULTRY: '/assets/categories/poultry.jpg',
  AGRICULTURE: '/assets/categories/agriculture.jpg',
  LIVESTOCK: '/assets/categories/livestock.jpg',
  TRANSPORT: '/assets/categories/transport.jpg',
  HANDICRAFT: '/assets/categories/handicraft.jpg',
  SERVICES: '/assets/categories/services.jpg',
  OTHER: '/assets/categories/other.jpg',
};

export const ABOUT_MEDIA = [
  '/assets/about/village-market.jpg',
  '/assets/about/farmland.jpg',
  '/assets/about/survey-moment.jpg',
];

export const STATE_MEDIA = {
  emptyDashboard: '/assets/states/empty-dashboard.jpg',
  offline: '/assets/states/offline.jpg',
  notFound: '/assets/states/not-found.jpg',
};