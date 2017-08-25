import client from './src/bot';
import { setupLogger } from './src/logger';

setupLogger();

client.start();
