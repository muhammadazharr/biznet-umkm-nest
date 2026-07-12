import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: any;

  const mockPrismaService = {
    raw: {
      user: {
        findUnique: jest.fn(),
      },
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    activeToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    toko: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEmailService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      mockPrismaService.raw.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toEqual({ id: 1, email: 'test@example.com' });
      expect(mockPrismaService.raw.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return null if user password does not match', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      mockPrismaService.raw.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.raw.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should delete existing tokens, sign new token, and create active token record', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockJwtService.sign.mockReturnValue('signed_jwt_token');

      const result = await service.login(mockUser);

      expect(result).toEqual({ status: true, token: 'signed_jwt_token' });
      expect(mockPrismaService.activeToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
      expect(mockPrismaService.activeToken.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          token: 'signed_jwt_token',
        },
      });
    });
  });

  describe('getProfile', () => {
    it('should return profile with role permissions and toko info for client user', async () => {
      const mockUser = { id: 1, email: 'client@example.com' } as any;
      const mockFullUser = {
        id: 1,
        email: 'client@example.com',
        username: 'client_username',
        password: 'hashed_password',
        pemilikToko: { tokoId: 42 },
        userRole: [
          {
            role: {
              name: 'client',
              rolePermissions: [
                { permission: { name: 'read:dashboard' } },
                { permission: { name: 'write:produk' } },
              ],
            },
          },
        ],
      };
      const mockToko = { id: 42, nama_toko: 'Toko Keren' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockFullUser);
      mockPrismaService.toko.findUnique.mockResolvedValue(mockToko);

      const result = await service.getProfile(mockUser);

      expect(result).toEqual({
        id: 1,
        email: 'client@example.com',
        username: 'client_username',
        pemilikToko: { tokoId: 42 },
        userRole: mockFullUser.userRole,
        toko: mockToko,
        roles: {
          name: 'client',
          rolePermissions: ['read:dashboard', 'write:produk'],
        },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        include: {
          pemilikToko: true,
          userRole: {
            select: {
              role: {
                select: {
                  name: true,
                  rolePermissions: {
                    select: {
                      permission: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      expect(mockPrismaService.toko.findUnique).toHaveBeenCalledWith({
        where: { id: 42 },
      });
    });

    it('should return profile without toko info if user is not client', async () => {
      const mockUser = { id: 2, email: 'admin@example.com' } as any;
      const mockFullUser = {
        id: 2,
        email: 'admin@example.com',
        username: 'admin_username',
        password: 'hashed_password',
        pemilikToko: null,
        userRole: [
          {
            role: {
              name: 'admin',
              rolePermissions: [],
            },
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockFullUser);

      const result = await service.getProfile(mockUser);

      expect(result).toEqual({
        id: 2,
        email: 'admin@example.com',
        username: 'admin_username',
        pemilikToko: null,
        userRole: mockFullUser.userRole,
        toko: null,
        roles: {
          name: 'admin',
          rolePermissions: [],
        },
      });
      expect(mockPrismaService.toko.findUnique).not.toHaveBeenCalled();
    });

    it('should return null if user is not found in database', async () => {
      const mockUser = { id: 99, email: 'nonexistent@example.com' } as any;
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getProfile(mockUser);
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should delete active token record', async () => {
      await service.logout('jwt_token_to_logout');
      expect(mockPrismaService.activeToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'jwt_token_to_logout' },
      });
    });
  });

  describe('changePassword', () => {
    it('should update password successfully', async () => {
      const mockUser = { id: 1, password: 'oldHashedPassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await service.changePassword(1, {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bcrypt.compare).toHaveBeenCalledWith('currentPassword123', 'oldHashedPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'newHashedPassword' },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(1, {
          currentPassword: 'currentPassword123',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      const mockUser = { id: 1, password: 'oldHashedPassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
