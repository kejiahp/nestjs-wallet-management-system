module.exports = {
  apps: [
    {
      name: 'wallet-management',
      script: './dist/main.js',
      instances: 1,
      autorestart: true, // restarts the process or app !!IMPORTANT
      watch: false,
      error_file: 'error.log',
      out_file: 'out_error.log',
      log_file: 'combined.log',
      time: true,
      // exec_mode: 'cluster', // pm2 execution mode
      // merge_logs: true, // merge all pm2 app logs in single files
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
