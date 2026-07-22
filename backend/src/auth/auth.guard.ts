import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação ausente.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // Inject user and tenant details into request
      request['user'] = {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException('Token de autenticação inválido ou expirado.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
