import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
        notebooks: {
          create: {
            name: 'First Notebook',
            isDefault: true,
            color: '#059669',
          },
        },
      },
    });

    const token = this.generateToken(user.id, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Register or update device session if deviceId supplied
    if (dto.deviceId) {
      await this.prisma.deviceSession.upsert({
        where: { userId_deviceId: { userId: user.id, deviceId: dto.deviceId } },
        update: {
          deviceName: dto.deviceName || 'Web Browser',
          platform: dto.platform || 'Web',
          userAgent,
          ipAddress,
          lastSyncAt: new Date(),
          isRevoked: false,
        },
        create: {
          userId: user.id,
          deviceId: dto.deviceId,
          deviceName: dto.deviceName || 'Web Browser',
          platform: dto.platform || 'Web',
          userAgent,
          ipAddress,
          lastSyncAt: new Date(),
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            notes: true,
            notebooks: true,
            tags: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
      },
    });
  }

  async listDeviceSessions(userId: string) {
    return this.prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastSyncAt: 'desc' },
    });
  }

  async revokeDeviceSession(userId: string, deviceId: string) {
    const session = await this.prisma.deviceSession.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });
    if (!session) {
      throw new NotFoundException('Device session not found');
    }

    return this.prisma.deviceSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );
  }
}
