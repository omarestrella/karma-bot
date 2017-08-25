import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Logger, transports } from 'winston';

const logDir = join(__dirname, 'logs');
const filePath = join(logDir, 'shia-bot.log')

export function setupLogger() {
    if (!existsSync(logDir)) {
        mkdirSync(logDir);
    }
}

const logger = new Logger({
    level: 'debug',
    transports: [
        new (transports.Console)(),
        new (transports.File)({
            filename: filePath
        })
    ]
});

export default logger;
