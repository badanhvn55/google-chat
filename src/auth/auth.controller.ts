import {
    Controller,
    Get,
    UseGuards,
    Res,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CheckTokenExpiryGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleLoginCallback(@Req() req, @Res() res: Response) {
        const googleToken = req.user.accessToken;
        const googleRefreshToken = req.user.refreshToken;

        res.cookie('social', 'google');
        res.cookie('access_token', googleToken, { httpOnly: true });
        res.cookie('refresh_token', googleRefreshToken, {
            httpOnly: true,
        });

        res.redirect('http://localhost:3000/auth/profile');
    }

    @UseGuards(CheckTokenExpiryGuard)
    @Get('profile')
    async getProfile(@Req() req) {
        const social = req.cookies['social'];
        const accessToken = req.cookies['access_token'];
        if (social && accessToken)
            return (await this.authService.getProfile(social, accessToken))
                .data && (await this.authService.getList(social, accessToken))
                    .data;
        throw new UnauthorizedException('No access token');
    }

    @Get('logout')
    logout(@Req() req, @Res() res: Response) {
        const social = req.cookies['social'];
        // const userId = req.cookies['user_id'];
        // const accessToken = req.cookies['access_token'];
        const refreshToken = req.cookies['refresh_token'];
        res.clearCookie('social');
        res.clearCookie('user_id');
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        switch (social) {
            case 'google':
                this.authService.revokeGoogleToken(refreshToken);
                break;
            // case 'facebook':
            //     this.authService.revokeFacebookToken(userId, accessToken);
            //     break;
        }
        res.redirect('http://localhost:3000/');
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin() { }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookLoginCallback(@Req() req, @Res() res: Response) {
        const user_id = req.user.id;
        const facebookToken = req.user.accessToken;
        const facebookRefreshToken = req.user.refreshToken;

        res.cookie('social', 'facebook');
        res.cookie('user_id', user_id, { httpOnly: true });
        res.cookie('access_token', facebookToken, { httpOnly: true });
        res.cookie('refresh_token', facebookRefreshToken, {
            httpOnly: true,
        });

        res.redirect('http://localhost:3000/auth/profile');
    }
}
