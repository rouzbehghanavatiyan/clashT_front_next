module.exports = {
  apps: [
    {
      name: "clashT-front",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },

      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
