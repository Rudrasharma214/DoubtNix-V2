export default {
  apps: [
    {
      name: 'doubtnix-api',
      script: 'src/server.js',
      env: {
        NODE_ENV: 'production',
      },
      env_file: '.env',
    },
  ],
};
