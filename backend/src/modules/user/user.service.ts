import type { FastifyInstance } from 'fastify';
import type { UpdateUserInput, UserProfile } from './user.schema.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';

// ============================================================
// User Service
// ============================================================

export class UserService {
  constructor(private readonly fastify: FastifyInstance) {}

  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        gender: true,
        dateOfBirth: true,
        category: true,
        isMinority: true,
        location: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
      category: user.category,
      isMinority: user.isMinority,
      location: user.location,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, input: UpdateUserInput): Promise<UserProfile> {
    // If email is being updated, check uniqueness
    if (input.email) {
      const existingEmail = await this.fastify.prisma.user.findFirst({
        where: {
          email: input.email,
          id: { not: userId },
        },
      });
      if (existingEmail) {
        throw new ConflictError('This email is already associated with another account');
      }
    }

    const user = await this.fastify.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.gender !== undefined && { gender: input.gender }),
        ...(input.dateOfBirth !== undefined && { dateOfBirth: new Date(input.dateOfBirth) }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.isMinority !== undefined && { isMinority: input.isMinority }),
        ...(input.location !== undefined && { location: input.location }),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        gender: true,
        dateOfBirth: true,
        category: true,
        isMinority: true,
        location: true,
        createdAt: true,
      },
    });

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
      category: user.category,
      isMinority: user.isMinority,
      location: user.location,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
