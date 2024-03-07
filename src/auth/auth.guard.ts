import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class CheckTokenExpiryGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const social = request.cookies['social'];
        const accessToken = request.cookies['access_token'];

        if (await this.authService.isTokenExpired(accessToken)) {
            const refreshToken = request.cookies['refresh_token'];

            if (!refreshToken) {
                throw new UnauthorizedException('Refresh token not found');
            }

            try {
                switch (social) {
                    case 'google':
                        const newAccessToken =
                            await this.authService.getNewAccessToken(refreshToken);
                        request.res.cookie('access_token', newAccessToken, {
                            httpOnly: true,
                        });
                        request.cookies['access_token'] = newAccessToken;
                        break;
                    case 'facebook':
                        const newFbAccessToken =
                            await this.authService.getFacebookNewAccessToken(accessToken);
                        request.res.cookie('access_token', newFbAccessToken, {
                            httpOnly: true,
                        });
                        request.cookies['access_token'] = newFbAccessToken;
                        break;
                }
            } catch (error) {
                throw new UnauthorizedException('Failed to refresh token');
            }
        }

        return true;
    }
}
