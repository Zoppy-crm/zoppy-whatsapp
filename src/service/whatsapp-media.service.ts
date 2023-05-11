import { WhatsappCreateSessionRequest } from '../request/whatsapp-create-session.request';
import { WhatsappRoutes } from '../util/whatsapp-routes';
import axios from 'axios';
import { WhatsappUtilities } from '../util/whatsapp-utilities';
import { UnprocessableEntityException } from '@nestjs/common';
import { ApiErrorMessages } from '@ZoppyTech/utilities';
import { WhatsappMediaUploadResponse } from '../response/whatsapp-media-upload.response';
import { WhatsappCreateSessionResponse } from '../response/whatsapp-create-session.response';
import { LogService } from './log/log.service';

export class WhatsappMediaService {
    public static async createSession(
        appId: string,
        token: string,
        request: WhatsappCreateSessionRequest
    ): Promise<WhatsappCreateSessionResponse> {
        try {
            const url: string = `${WhatsappRoutes.makeBaseUrl()}/${appId}/uploads?file_length=${request.fileSize}&file_type-${
                request.mimetype
            }`;

            await LogService.info({
                message: {
                    message: 'Send whatsapp business create session request',
                    url: url,
                    headers: WhatsappUtilities.makeAuthorization(token)
                }
            });

            const response: any = await axios.post(url, {}, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log('Failed to execute create Ssssion on Wpp Business');
            console.log(error);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }

    public static async uploadFile(sessionId: string, token: string, file: any, mimetype: string): Promise<WhatsappMediaUploadResponse> {
        try {
            const headers: any = {
                file_offset: '0',
                'Content-Type': mimetype,
                Authorization: `OAuth ${token}`
            };
            const url: string = `${WhatsappRoutes.makeBaseUrl()}/${sessionId}`;

            await LogService.info({
                message: {
                    message: 'Send whatsapp business upload file request',
                    url: url,
                    headers: headers
                }
            });

            const response: any = await axios.post(url, file, {
                headers: headers
            });
            return response.data;
        } catch (error: any) {
            console.log('Failed to execute upload file on Wpp Business');
            console.log(error);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }
}
