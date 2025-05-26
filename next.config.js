/** @type {import('next').NextConfig} */

const nextConfig = {
images: {
    domains: ['utfs.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      }
    ]
  }
}

module.exports = nextConfig;





// const path = require('path');

// module.exports = {
//   // ... rest of Webpack configuration
//   resolve: {
//     alias: {
//       "@/types": path.resolve(__dirname, "src/types"),
//       // ... other aliases
//     }
//   }
// };
