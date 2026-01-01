module.exports = {
  apps: [
    {
      name: 'doubtnix-api',
      script: 'src/server.js',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
