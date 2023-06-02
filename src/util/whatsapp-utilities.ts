import { UnprocessableEntityException } from '@nestjs/common';
import { StringUtil, WhatsappConstants } from '@ZoppyTech/utilities';
import { AxiosRequestConfig } from 'axios';

export class WhatsappUtilities {
    public static makeAuthorization(token: string): AxiosRequestConfig {
        const config: AxiosRequestConfig = {
            headers: { Authorization: `Bearer ${token}` }
        };
        return config;
    }

    public static replaceWhiteSpaces(name: string): string {
        return name.replace(/\s/g, '_');
    }

    public static getFileExtFromMimeType(mimeType: string): string {
        const result: Array<string> = mimeType.split('/');
        return result.pop();
    }

    public static getFileTypeFromMimeType(mimeType: string): WhatsappFileType {
        switch (mimeType) {
            case WhatsappConstants.SUPPORTED_MEDIA_TYPES.IMAGE.JPEG:
                return { name: 'image', ext: 'jpeg' };
            case WhatsappConstants.SUPPORTED_MEDIA_TYPES.IMAGE.PNG:
                return { name: 'image', ext: 'jpeg' };
            case WhatsappConstants.SUPPORTED_MEDIA_TYPES.AUDIO.OGG:
                return { name: 'audio', ext: 'ogg' };
            case WhatsappConstants.SUPPORTED_MEDIA_TYPES.DOCUMENT.TEXT_PLAIN:
                return { name: 'document', ext: 'txt' };
            case WhatsappConstants.SUPPORTED_MEDIA_TYPES.DOCUMENT.PDF:
                return { name: 'document', ext: 'pdf' };
            case WhatsappConstants.SUPPORTED_MEDIA_TYPES.DOCUMENT.MS_WORD:
                return { name: 'document', ext: 'docx' };
            case WhatsappConstants.SUPPORTED_MEDIA_TYPES.DOCUMENT.MS_EXCEL:
                return { name: 'document', ext: 'xlsx' };
            default:
                throw new UnprocessableEntityException('Tipo de mensagem não suportada.');
        }
    }

    public static validateSessionExpiration(expiration: string): boolean {
        if (!expiration) return false;
        const targetTime: Date = new Date(Number.parseInt(expiration));
        const difference: number = targetTime.getTime() - Date.now();
        if (difference <= 0) return false;
        return true;
    }

    public static makeNewSessionTimestamp(): string {
        const dateNow: Date = new Date();
        return dateNow
            .setDate(dateNow.getDate() + 1)
            .toString()
            .padEnd(13, '0');
    }

    public static formatSessionExpiration(expiration: string = null): string | null {
        if (!expiration) {
            return WhatsappUtilities.makeNewSessionTimestamp();
        }
        return expiration.padEnd(13, '0');
    }

    public static formatTemplateBody(text: string): string {
        return StringUtil.replaceAll(StringUtil.replaceAll(text, '\\n', '\n'), '\n\n', '\n \n');
    }
}

export interface WhatsappFileType {
    name: string;
    ext: string;
}
