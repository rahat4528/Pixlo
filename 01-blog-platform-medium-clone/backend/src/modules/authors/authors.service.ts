import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateProfileDto } from './authors.dto';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUsername(username: string, currentUserId?: string) {
    const profile = await this.prisma.authorProfile.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        user: {
          select: {
            id: true,
            createdAt: true,
            _count: {
              select: {
                followers: true,
                following: true,
                articles: {
                  where: { status: ArticleStatus.PUBLISHED },
                },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Author profile @${username} not found`);
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== profile.userId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: currentUserId,
            followeeId: profile.userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      id: profile.id,
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      socialLinks: profile.socialLinks,
      isPaidAuthor: profile.isPaidAuthor,
      joinedAt: profile.createdAt,
      stats: {
        followersCount: profile.user._count.followers,
        followingCount: profile.user._count.following,
        publishedArticlesCount: profile.user._count.articles,
      },
      isFollowing,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.authorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Author profile not found for this user');
    }

    const updated = await this.prisma.authorProfile.update({
      where: { userId },
      data: {
        ...(dto.displayName && { displayName: dto.displayName }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.socialLinks && { socialLinks: dto.socialLinks }),
      },
    });

    return updated;
  }

  async followAuthor(followerId: string, username: string) {
    const targetProfile = await this.prisma.authorProfile.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!targetProfile) {
      throw new NotFoundException(`Author @${username} not found`);
    }

    if (followerId === targetProfile.userId) {
      throw new BadRequestException('Authors cannot follow themselves');
    }

    await this.prisma.follow.upsert({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId: targetProfile.userId,
        },
      },
      create: {
        followerId,
        followeeId: targetProfile.userId,
      },
      update: {},
    });

    return { following: true };
  }

  async unfollowAuthor(followerId: string, username: string) {
    const targetProfile = await this.prisma.authorProfile.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!targetProfile) {
      throw new NotFoundException(`Author @${username} not found`);
    }

    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followeeId: targetProfile.userId,
      },
    });

    return { following: false };
  }
}
