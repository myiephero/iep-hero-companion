import {
  users,
  auth_tokens,
  type User,
  type UpsertUser,
  type AuthToken,
  type InsertAuthToken,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, gt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Auth token operations
  createAuthToken(tokenData: InsertAuthToken): Promise<AuthToken>;
  validateAuthToken(token: string): Promise<AuthToken | undefined>;
  deleteAuthToken(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Auth token operations
  async createAuthToken(tokenData: InsertAuthToken): Promise<AuthToken> {
    const [token] = await db
      .insert(auth_tokens)
      .values(tokenData)
      .returning();
    return token;
  }
  
  async validateAuthToken(token: string): Promise<AuthToken | undefined> {
    const [tokenRecord] = await db
      .select()
      .from(auth_tokens)
      .where(and(
        eq(auth_tokens.token, token),
        gt(auth_tokens.expires_at, new Date())
      ))
      .limit(1);
    return tokenRecord;
  }
  
  async deleteAuthToken(token: string): Promise<void> {
    await db
      .delete(auth_tokens)
      .where(eq(auth_tokens.token, token));
  }
}

export const storage = new DatabaseStorage();