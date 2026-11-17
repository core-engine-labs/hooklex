import path from "node:path";
import pino from "pino";


export const logger = pino({
  // Leave global level default ('info'), so info/warn/error are all allowed globally
  transport: {
    targets: [
      // 1. Console target: catches everything from 'info' and above
      {
        level: 'info', 
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'
        }
      },

      // 2. File target: catches ONLY 'error' and above
      {
        level: 'error', 
        target: 'pino-roll',
        options: {
          file: path.join(process.cwd(), 'logs', 'error.log'),
          frequency: 'daily',
          dateFormat: 'yyyy-MM-dd',
          limit: { count: 2 },
          mkdir: true
        }
      }
    ]
  }
});
