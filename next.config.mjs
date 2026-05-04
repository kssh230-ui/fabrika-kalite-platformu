/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; // Eğer dosyanın adı mjs ise "export default nextConfig;" yazmalısın.