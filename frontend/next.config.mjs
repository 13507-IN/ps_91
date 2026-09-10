/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ['chart.js', 'react-chartjs-2'],
};

export default nextConfig;