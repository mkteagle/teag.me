import { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      fullySpecified: false, // Allow "node:" prefixed modules
    };

    config.externals = [
      ...(config.externals || []),
      ({ request }: any, callback: any) => {
        if (request && request.startsWith("node:")) {
          return callback(null, `commonjs ${request.slice(5)}`);
        }
        callback();
      },
    ];

    return config;
  },
};

export default nextConfig;
