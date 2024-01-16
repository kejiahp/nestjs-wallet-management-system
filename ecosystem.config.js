module.exports = {
  apps: [
    {
      name: 'wallet-management',
      script: './dist/main.js',
      instances: 1, // 0 means the amount of workers equal the amount of cpu cores
      autorestart: true, // restarts the process or app !!IMPORTANT
      watch: false,
      error_file: 'error.log',
      out_file: 'out_error.log',
      log_file: 'combined.log',
      time: true,
      // exec_mode: 'cluster', // cluster pm2 execution mode scales the app based on the number of cores available. 16 cores == 16 pm2 workers. Workers can't share state
      // merge_logs: true, // merge all pm2 app logs in single files
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
