import { Client } from 'yamdbf';

declare interface Channel {
    send: (string) => void
}

declare interface Message {
    author: User,
    mentions: MessageMentions,
    content: string,
    channel: Channel
}

declare interface MessageMentions {
    users: Map<string, User>
}

declare interface User {
    id: string,
    bot: boolean,
    username: string
}

declare type DiscordClient = Client & {
    users: Map<string, User>
}
