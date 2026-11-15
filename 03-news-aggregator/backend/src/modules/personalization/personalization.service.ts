import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdatePreferencesDto } from './personalization.dto';

@Injectable()
export class PersonalizationService {
  constructor(private prisma: PrismaService) {}

  async getPreferences(userId: string) {
    let pref = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await this.prisma.userPreference.create({
        data: {
          userId,
          preferredCategories: JSON.stringify(['technology', 'business']),
          preferredTopics: JSON.stringify([]),
        },
      });
    }

    return {
      id: pref.id,
      userId: pref.userId,
      preferredCategories: JSON.parse(pref.preferredCategories || '[]'),
      preferredTopics: JSON.parse(pref.preferredTopics || '[]'),
      emailAlerts: pref.emailAlerts,
      breakingAlerts: pref.breakingAlerts,
      compactMode: pref.compactMode,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const dataToUpdate: any = {};

    if (dto.preferredCategories !== undefined) {
      dataToUpdate.preferredCategories = JSON.stringify(dto.preferredCategories);
    }
    if (dto.preferredTopics !== undefined) {
      dataToUpdate.preferredTopics = JSON.stringify(dto.preferredTopics);
    }
    if (dto.emailAlerts !== undefined) {
      dataToUpdate.emailAlerts = dto.emailAlerts;
    }
    if (dto.breakingAlerts !== undefined) {
      dataToUpdate.breakingAlerts = dto.breakingAlerts;
    }
    if (dto.compactMode !== undefined) {
      dataToUpdate.compactMode = dto.compactMode;
    }

    const pref = await this.prisma.userPreference.upsert({
      where: { userId },
      update: dataToUpdate,
      create: {
        userId,
        ...dataToUpdate,
      },
    });

    return {
      id: pref.id,
      userId: pref.userId,
      preferredCategories: JSON.parse(pref.preferredCategories || '[]'),
      preferredTopics: JSON.parse(pref.preferredTopics || '[]'),
      emailAlerts: pref.emailAlerts,
      breakingAlerts: pref.breakingAlerts,
      compactMode: pref.compactMode,
    };
  }

  async getPersonalizedFeed(userId: string, limit: number = 30) {
    // 1. Fetch user preferences and followed publishers
    const [preferences, followedSources] = await Promise.all([
      this.getPreferences(userId),
      this.prisma.followedSource.findMany({
        where: { userId },
        select: { sourceId: true },
      }),
    ]);

    const followedSet = new Set(followedSources.map((f) => f.sourceId));
    const preferredCatSet = new Set(preferences.preferredCategories.map((c: string) => c.toLowerCase()));

    // 2. Query recent candidate articles from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const candidates = await this.prisma.newsArticle.findMany({
      where: {
        publishedAt: { gte: sevenDaysAgo },
      },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            slug: true,
            websiteUrl: true,
            logoUrl: true,
          },
        },
        cluster: {
          select: {
            id: true,
            title: true,
            articleCount: true,
            isBreaking: true,
          },
        },
      },
      take: 200,
    });

    // 3. Score each article
    const now = Date.now();
    const scoredArticles = candidates.map((article) => {
      let score = 0;

      // Followed publisher bonus (+40 points)
      if (followedSet.has(article.sourceId)) {
        score += 40;
      }

      // Preferred category bonus (+25 points)
      if (preferredCatSet.has(article.category.toLowerCase())) {
        score += 25;
      }

      // Breaking news bonus (+30 points)
      if (article.isBreaking) {
        score += 30;
      }

      // Time decay: 48-hour half-life
      const ageHours = Math.max(0, (now - article.publishedAt.getTime()) / (1000 * 3600));
      const decayMultiplier = Math.pow(0.5, ageHours / 48);

      const finalScore = (score + 10) * decayMultiplier;

      return {
        article,
        score: finalScore,
      };
    });

    // Sort by descending score
    scoredArticles.sort((a, b) => b.score - a.score);

    return scoredArticles.slice(0, limit).map((s) => ({
      ...s.article,
      feedScore: Math.round(s.score * 10) / 10,
    }));
  }
}
