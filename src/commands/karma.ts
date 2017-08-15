import { Command, CommandDecorators } from 'yamdbf';
import { Message } from '../types';

export default class KarmaCommand extends Command {
    public constructor () {
		super({
			name: 'karma',
			desc: 'Get the karma for a user',
			usage: '<prefix>karma <username>'
		});
    }

    action(message: Message, args: any[]) {
        console.debug('Checking karma...');

        const username = args.join(' ');
        const storage = this.client.storage;

        storage.get(username).then(data => {
            try {
                data = JSON.parse(data);
            } catch (e) {}

            if (!data) {
                data = {};
            }

            message.channel.send(`${username} has ${data.karma || 0} karma and ${data.karmaBank || 0} in the bank.`);
        });

    }
}
