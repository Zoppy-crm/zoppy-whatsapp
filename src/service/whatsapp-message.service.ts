import { TextMessageResponse } from '../response/text-message.response';
import axios from 'axios';
import { WhatsappRoutes } from '../util/whatsapp-routes';
import { ApiErrorMessages, MessageTemplateConstants, WhatsappConstants } from '@ZoppyTech/utilities';
import { UnprocessableEntityException } from '@nestjs/common';
import { WhatsappUtilities } from '../util/whatsapp-utilities';
import { LogService } from './log/log.service';

export class WhatsappMessageService {
    public static async sendTemplateMessage(
        from: string,
        to: string,
        token: string,
        params: SendTemplateMessageParameters
    ): Promise<TextMessageResponse> {
        try {
            params.textParams = params.textParams ?? [];
            params.headerParams = params.headerParams ?? [];

            const url: string = WhatsappRoutes.getMessagesUrl(from);
            const body: SendTemplateMessageBody = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: params.wppName,
                    language: {
                        code: WhatsappConstants.LANGUAGE_CODES.PT_BR
                    },
                    components: []
                }
            };

            body.template.components.push({
                type: 'body',
                parameters: params.textParams.map((param: string) => {
                    return {
                        type: 'text',
                        text: param ? param : ' '
                    };
                })
            });

            if (params.hasHeader) {
                switch (params.headerType) {
                    case WhatsappConstants.MESSAGE_TEMPLATES.HEADER_TYPES.TEXT:
                        body.template.components.push({
                            type: 'header',
                            parameters: params.headerParams.map((param: string) => {
                                return {
                                    type: 'text',
                                    text: param ? param : ' '
                                };
                            })
                        });
                        break;
                    case WhatsappConstants.MESSAGE_TEMPLATES.HEADER_TYPES.VIDEO:
                        body.template.components.push({
                            type: 'header',
                            parameters: [
                                {
                                    type: 'video',
                                    video: {
                                        link: params.fileUrl
                                    }
                                }
                            ]
                        });
                        break;
                    case WhatsappConstants.MESSAGE_TEMPLATES.HEADER_TYPES.IMAGE:
                        body.template.components.push({
                            type: 'header',
                            parameters: [
                                {
                                    type: 'image',
                                    image: {
                                        link: params.fileUrl
                                    }
                                }
                            ]
                        });
                        break;
                }
            }

            console.log({
                url: url,
                body: JSON.stringify(body),
                auth: WhatsappUtilities.makeAuthorization(token)
            });
            const response: any = await axios.post(url, body, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            await LogService.error({
                message: {
                    message: '[WhatsappMessageService]: Error when trying to send template message for customer',
                    error: error
                }
            });
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }
}

export interface SendTemplateMessageParameters {
    wppName: string;
    headerParams?: Array<string>;
    textParams?: Array<string>;
    headerType: string;
    fileUrl: string;
    hasHeader: boolean;
}

export interface SendTemplateMessageBody {
    messaging_product: string;
    to: string;
    type: string;
    template: {
        name: string;
        language: {
            code: string;
        };
        components: SendTemplateMessageComponentBody[];
    };
}

export interface SendTemplateMessageComponentParameterBody {
    type: string;
    text?: string;
    image?: {
        link: string;
    };
    video?: {
        link: string;
    };
}
export interface SendTemplateMessageComponentBody {
    type: string;
    parameters: SendTemplateMessageComponentParameterBody[];
}

export interface SendTemplateMessageResponse {
    messaging_product: string;
    contacts: SendTemplateMessageContactResponse[];
    messages: SendTemplateMessageMsgResponse[];
}

export interface SendTemplateMessageContactResponse {
    input: string;
    wa_id: string;
}

export interface SendTemplateMessageMsgResponse {
    id: string;
}
