import { CustomMutatorDefs } from "@rocicorp/zero";
import { AuthData } from "./auth";
import { 
  schema, 
  Message, 
  MessageUpdate, 
  User, 
  Room, 
  RoomMember, 
  Chat, 
  Attachment, 
  WebSearch, 
  Image, 
  ShareLink 
} from "./schema";

export function createMutators(authData: AuthData | undefined) {
  return {
    user: {
      async create(tx, user: User) {
        await tx.mutate.user.insert(user);
      },
      async update(tx, user: Partial<User> & { id: string }) {
        await tx.mutate.user.update(user);
      },
    },
    room: {
      async create(tx, room: Room) {
        mustBeLoggedIn(authData);
        await tx.mutate.room.insert(room);
      },
      async update(tx, room: Partial<Room> & { id: string }) {
        mustBeLoggedIn(authData);
        await tx.mutate.room.update(room);
      },
      async delete(tx, id: string) {
        mustBeLoggedIn(authData);
        await tx.mutate.room.delete({ id });
      },
    },
    roomMember: {
      async join(tx, roomMember: RoomMember) {
        mustBeLoggedIn(authData);
        await tx.mutate.roomMember.insert(roomMember);
      },
      async leave(tx, roomMember: { roomID: string; userID: string }) {
        mustBeLoggedIn(authData);
        await tx.mutate.roomMember.delete(roomMember);
      },
    },
    chat: {
      async create(tx, chat: Chat) {
        mustBeLoggedIn(authData);
        await tx.mutate.chat.insert(chat);
      },
      async update(tx, chat: Partial<Chat> & { id: string }) {
        mustBeLoggedIn(authData);
        await tx.mutate.chat.update(chat);
      },
      async delete(tx, id: string) {
        mustBeLoggedIn(authData);
        await tx.mutate.chat.delete({ id });
      },
    },
    message: {
      async create(tx, message: Message) {
        mustBeLoggedIn(authData);
        await tx.mutate.message.insert(message);
      },
      async delete(tx, id: string) {
        const auth = mustBeLoggedIn(authData);
        const prev = await tx.query.message.where("id", id).one();
        if (!prev) {
          return;
        }
        if (prev.senderID !== auth.sub && prev.senderID !== auth.clerkUserID) {
          throw new Error("Must be sender of message to delete");
        }
        await tx.mutate.message.delete({ id });
      },
      async update(tx, message: MessageUpdate) {
        const auth = mustBeLoggedIn(authData);
        const prev = await tx.query.message.where("id", message.id).one();
        if (!prev) {
          return;
        }
        if (prev.senderID !== auth.sub && prev.senderID !== auth.clerkUserID) {
          throw new Error("Must be sender of message to edit");
        }
        await tx.mutate.message.update(message);
      },
      async branch(tx, originalMessageId: string, newMessage: Message) {
        mustBeLoggedIn(authData);
        const branchedMessage = {
          ...newMessage,
          parentID: originalMessageId,
        };
        await tx.mutate.message.insert(branchedMessage);
      },
      async updateStreamState(tx, id: string, streamState: string, isComplete: boolean) {
        await tx.mutate.message.update({ id, streamState, isComplete });
      },
    },
    attachment: {
      async create(tx, attachment: Attachment) {
        mustBeLoggedIn(authData);
        await tx.mutate.attachment.insert(attachment);
      },
      async delete(tx, id: string) {
        const auth = mustBeLoggedIn(authData);
        const attachment = await tx.query.attachment.where("id", id).one();
        if (!attachment) {
          return;
        }
        if (attachment.uploaderID !== auth.sub && attachment.uploaderID !== auth.clerkUserID) {
          throw new Error("Must be uploader to delete attachment");
        }
        await tx.mutate.attachment.delete({ id });
      },
    },
    webSearch: {
      async create(tx, webSearch: WebSearch) {
        mustBeLoggedIn(authData);
        await tx.mutate.webSearch.insert(webSearch);
      },
    },
    image: {
      async create(tx, image: Image) {
        mustBeLoggedIn(authData);
        await tx.mutate.image.insert(image);
      },
    },
    shareLink: {
      async create(tx, shareLink: ShareLink) {
        mustBeLoggedIn(authData);
        await tx.mutate.shareLink.insert(shareLink);
      },
      async delete(tx, id: string) {
        const auth = mustBeLoggedIn(authData);
        const shareLink = await tx.query.shareLink.where("id", id).one();
        if (!shareLink) {
          return;
        }
        if (shareLink.createdBy !== auth.sub && shareLink.createdBy !== auth.clerkUserID) {
          throw new Error("Must be creator to delete share link");
        }
        await tx.mutate.shareLink.delete({ id });
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

function mustBeLoggedIn(authData: AuthData | undefined): AuthData {
  if (authData === undefined) {
    throw new Error("Must be logged in");
  }
  return authData;
}

export type Mutators = ReturnType<typeof createMutators>;
