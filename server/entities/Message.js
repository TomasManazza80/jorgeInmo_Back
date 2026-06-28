import { EntitySchema } from 'typeorm';

export const MessageSchema = new EntitySchema({
  name: 'Message',
  tableName: 'message',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    content: { type: 'json' },
    type: { type: 'varchar' },
    timestamp: { name: 'time_stamp', type: 'timestamptz', createDate: true },
    senderId: { name: 'senderId', type: 'int' },
    receiverId: { name: 'receiverId', type: 'int' },
  },
  relations: {
    sender: { target: 'User', type: 'many-to-one', joinColumn: { name: 'senderId' }, inverseSide: 'sentMessages' },
    receiver: { target: 'User', type: 'many-to-one', joinColumn: { name: 'receiverId' }, inverseSide: 'receivedMessages' },
  },
  indices: [
    { name: 'idx_message_conversation_timestamp', columns: ['senderId', 'receiverId', 'timestamp'] }
  ]
});
