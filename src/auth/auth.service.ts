import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    async getNewAccessToken(refreshToken: string): Promise<string> {
        try {
            const response = await axios.post(
                'https://accounts.google.com/o/oauth2/token',
                {
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                },
            );

            return response.data.access_token;
        } catch (error) {
            throw new Error('Failed to refresh the access token.');
        }
    }

    async getFacebookNewAccessToken(accessToken: string): Promise<string> {
        try {
            const response = await axios.get(
                `https://graph.facebook.com/v19.0/oauth/access_token?  
                grant_type=fb_exchange_token&          
                client_id=${process.env.FACEBOOK_APP_ID}&
                client_secret=${process.env.FACEBOOK_APP_SECRET}&
                fb_exchange_token=${accessToken}`,
            );

            return response.data.access_token;
        } catch (error) {
            console.log(error);

            throw new Error('Failed to refresh the fb access token.');
        }
    }

    async getProfile(social: string, token: string) {
        try {
            switch (social) {
                case 'google':
                    return axios.get(
                        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
                    );
                case 'facebook':
                    return axios.get(
                        `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture`,
                    );
            }
        } catch (error) {
            console.error('Failed to revoke the token:', error);
        }
    }

    async getList(social: string, token: string) {
        try {
            if (social === 'google') {
                return axios.get(
                    `https://chat.googleapis.com/v1/spaces?access_token=${token}&filter=GROUP_CHAT&filter=DIRECT_MESSAGE&pageSize=10`,
                );
            }
            return {
                data: null
            }
        } catch (error) {
            console.error('Failed to revoke the token:', error);
        }
    }

    async isTokenExpired(token: string): Promise<boolean> {
        try {
            const response = await axios.get(
                `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
            );

            const expiresIn = response.data.expires_in;

            if (!expiresIn || expiresIn <= 0) {
                return true;
            }
        } catch (error) {
            return true;
        }
    }

    async revokeGoogleToken(token: string) {
        try {
            await axios.get(
                `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
            );
        } catch (error) {
            console.error('Failed to revoke the token:', error);
        }
    }

    async revokeFacebookToken(userId: string, accessToken: string) {
        try {
            await axios.delete(
                `https://graph.facebook.com/${userId}/permissions?access_token=${accessToken}`,
            );
        } catch (error) {
            console.error('Failed to revoke the token:', error);
        }
    }
}
