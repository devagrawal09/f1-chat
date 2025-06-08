// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  definePermissions,
  Row,
  ANYONE_CAN,
  table,
  string,
  boolean,
  relationships,
  PermissionsConfig,
  UpdateValue,
  number,
} from "@rocicorp/zero";
import { AuthData } from "./auth";

const user = table("user")
  .columns({
    id: string(),
    name: string(),
    email: string(),
    clerkUserID: string(),
  })
  .primaryKey("id");

const room = table("room")
  .columns({
    id: string(),
    name: string(),
    createdAt: number(),
    ownerID: string(),
    isPublic: boolean(),
  })
  .primaryKey("id");

const roomMember = table("roomMember")
  .columns({
    roomID: string(),
    userID: string(),
    joinedAt: number(),
  })
  .primaryKey("roomID", "userID");

const chat = table("chat")
  .columns({
    id: string(),
    title: string(),
    roomID: string(),
    ownerID: string(),
    createdAt: number(),
  })
  .primaryKey("id");

const message = table("message")
  .columns({
    id: string(),
    chatID: string(),
    roomID: string(),
    senderID: string(),
    body: string(),
    timestamp: number(),
    model: string(),
    parentID: string(),
    attachmentID: string(),
    webSearchID: string(),
    imageID: string(),
    streamState: string(),
    isComplete: boolean(),
  })
  .primaryKey("id");

const attachment = table("attachment")
  .columns({
    id: string(),
    url: string(),
    type: string(),
    filename: string(),
    uploaderID: string(),
    uploadedAt: number(),
    messageID: string(),
  })
  .primaryKey("id");

const webSearch = table("webSearch")
  .columns({
    id: string(),
    query: string(),
    results: string(),
    timestamp: number(),
    messageID: string(),
  })
  .primaryKey("id");

const image = table("image")
  .columns({
    id: string(),
    url: string(),
    prompt: string(),
    model: string(),
    generatedAt: number(),
    messageID: string(),
  })
  .primaryKey("id");

const shareLink = table("shareLink")
  .columns({
    id: string(),
    chatID: string(),
    createdBy: string(),
    createdAt: number(),
    isPublic: boolean(),
    allowCollaboration: boolean(),
  })
  .primaryKey("id");

// Relationships
const userRelationships = relationships(user, ({ many }) => ({
  roomMemberships: many({
    sourceField: ["id"],
    destField: ["userID"],
    destSchema: roomMember,
  }),
  ownedRooms: many({
    sourceField: ["id"],
    destField: ["ownerID"],
    destSchema: room,
  }),
  ownedChats: many({
    sourceField: ["id"],
    destField: ["ownerID"],
    destSchema: chat,
  }),
  sentMessages: many({
    sourceField: ["id"],
    destField: ["senderID"],
    destSchema: message,
  }),
}));

const roomRelationships = relationships(room, ({ one, many }) => ({
  owner: one({
    sourceField: ["ownerID"],
    destField: ["id"],
    destSchema: user,
  }),
  members: many({
    sourceField: ["id"],
    destField: ["roomID"],
    destSchema: roomMember,
  }),
  chats: many({
    sourceField: ["id"],
    destField: ["roomID"],
    destSchema: chat,
  }),
  messages: many({
    sourceField: ["id"],
    destField: ["roomID"],
    destSchema: message,
  }),
}));

const roomMemberRelationships = relationships(roomMember, ({ one }) => ({
  room: one({
    sourceField: ["roomID"],
    destField: ["id"],
    destSchema: room,
  }),
  user: one({
    sourceField: ["userID"],
    destField: ["id"],
    destSchema: user,
  }),
}));

const chatRelationships = relationships(chat, ({ one, many }) => ({
  room: one({
    sourceField: ["roomID"],
    destField: ["id"],
    destSchema: room,
  }),
  owner: one({
    sourceField: ["ownerID"],
    destField: ["id"],
    destSchema: user,
  }),
  messages: many({
    sourceField: ["id"],
    destField: ["chatID"],
    destSchema: message,
  }),
  shareLinks: many({
    sourceField: ["id"],
    destField: ["chatID"],
    destSchema: shareLink,
  }),
}));

const messageRelationships = relationships(message, ({ one, many }) => ({
  sender: one({
    sourceField: ["senderID"],
    destField: ["id"],
    destSchema: user,
  }),
  chat: one({
    sourceField: ["chatID"],
    destField: ["id"],
    destSchema: chat,
  }),
  room: one({
    sourceField: ["roomID"],
    destField: ["id"],
    destSchema: room,
  }),
  parent: one({
    sourceField: ["parentID"],
    destField: ["id"],
    destSchema: message,
  }),
  branches: many({
    sourceField: ["id"],
    destField: ["parentID"],
    destSchema: message,
  }),
  attachment: one({
    sourceField: ["attachmentID"],
    destField: ["id"],
    destSchema: attachment,
  }),
  webSearch: one({
    sourceField: ["webSearchID"],
    destField: ["id"],
    destSchema: webSearch,
  }),
  image: one({
    sourceField: ["imageID"],
    destField: ["id"],
    destSchema: image,
  }),
}));

const attachmentRelationships = relationships(attachment, ({ one }) => ({
  uploader: one({
    sourceField: ["uploaderID"],
    destField: ["id"],
    destSchema: user,
  }),
  message: one({
    sourceField: ["messageID"],
    destField: ["id"],
    destSchema: message,
  }),
}));

const webSearchRelationships = relationships(webSearch, ({ one }) => ({
  message: one({
    sourceField: ["messageID"],
    destField: ["id"],
    destSchema: message,
  }),
}));

const imageRelationships = relationships(image, ({ one }) => ({
  message: one({
    sourceField: ["messageID"],
    destField: ["id"],
    destSchema: message,
  }),
}));

const shareLinkRelationships = relationships(shareLink, ({ one }) => ({
  chat: one({
    sourceField: ["chatID"],
    destField: ["id"],
    destSchema: chat,
  }),
  creator: one({
    sourceField: ["createdBy"],
    destField: ["id"],
    destSchema: user,
  }),
}));

export const schema = createSchema({
  tables: [
    user,
    room,
    roomMember,
    chat,
    message,
    attachment,
    webSearch,
    image,
    shareLink,
  ],
  relationships: [
    userRelationships,
    roomRelationships,
    roomMemberRelationships,
    chatRelationships,
    messageRelationships,
    attachmentRelationships,
    webSearchRelationships,
    imageRelationships,
    shareLinkRelationships,
  ],
});

export type Schema = typeof schema;
export type User = Row<typeof schema.tables.user>;
export type Room = Row<typeof schema.tables.room>;
export type RoomMember = Row<typeof schema.tables.roomMember>;
export type Chat = Row<typeof schema.tables.chat>;
export type Message = Row<typeof schema.tables.message>;
export type MessageUpdate = UpdateValue<typeof schema.tables.message>;
export type Attachment = Row<typeof schema.tables.attachment>;
export type WebSearch = Row<typeof schema.tables.webSearch>;
export type Image = Row<typeof schema.tables.image>;
export type ShareLink = Row<typeof schema.tables.shareLink>;

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  return {
    user: {
      row: {
        select: ANYONE_CAN,
      },
    },
    room: {
      row: {
        select: ANYONE_CAN,
      },
    },
    roomMember: {
      row: {
        select: ANYONE_CAN,
      },
    },
    chat: {
      row: {
        select: ANYONE_CAN,
      },
    },
    message: {
      row: {
        select: ANYONE_CAN,
      },
    },
    attachment: {
      row: {
        select: ANYONE_CAN,
      },
    },
    webSearch: {
      row: {
        select: ANYONE_CAN,
      },
    },
    image: {
      row: {
        select: ANYONE_CAN,
      },
    },
    shareLink: {
      row: {
        select: ANYONE_CAN,
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});

export default {
  schema,
  permissions,
};
