import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully and return response', async () => {
      const mockLoginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockLoginResult = { status: true, token: 'signed_jwt_token' };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      const result = await controller.login(mockLoginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(mockLoginDto.email, mockLoginDto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Login berhasil',
        data: mockLoginResult,
      });
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      const mockLoginDto = { email: 'test@example.com', password: 'wrongpassword' };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(mockLoginDto.email, mockLoginDto.password);
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('should return user profile response', async () => {
      const mockReq = { user: { id: 1, email: 'test@example.com' } };
      const mockProfile = { id: 1, email: 'test@example.com', username: 'testuser', toko: null, roles: [] };

      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.me(mockReq);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockReq.user);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Profil pengguna berhasil diambil',
        data: mockProfile,
      });
    });
  });

  describe('logout', () => {
    it('should logout user and return success response', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer jwt_token_string',
        },
      };

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockReq);

      expect(mockAuthService.logout).toHaveBeenCalledWith('jwt_token_string');
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Logout berhasil',
        data: null,
      });
    });
  });
});
