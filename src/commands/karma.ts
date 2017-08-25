import { Command, CommandDecorators } from 'yamdbf';
import { Message } from '../types';
import { extractUsers } from '../utils';

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

        let username = args.join(' ');
        const storage = this.client.storage;

        if (message.mentions && message.mentions.users) {
            const user = extractUsers(message.mentions.users)[0];
            if (user) {
                username = user.username;
            }
        }

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
