import { TextMessageResponse } from '../response/text-message.response';
import axios from 'axios';
import { WhatsappRoutes } from '../util/whatsapp-routes';
import { ApiErrorMessages, WhatsappConstants } from '@ZoppyTech/utilities';
import { UnprocessableEntityException } from '@nestjs/common';
import { WhatsappUtilities } from '../util/whatsapp-utilities';

export class WhatsappMessageService {
    public static async sendTemplateMessage(
        from: string,
        to: string,
        token: string,
        params: SendTemplateMessageParameters
    ): Promise<TextMessageResponse> {
        try {
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

            if (params.textParams && params.textParams.length) {
                body.template.components.push({
                    type: 'body',
                    parameters: params.textParams.map((param: string) => {
                        return {
                            type: 'text',
                            text: param
                        };
                    })
                });
            }

            if (params.headerParams && params.headerParams.length) {
                body.template.components.push({
                    type: 'header',
                    parameters: params.headerParams.map((param: string) => {
                        return {
                            type: 'text',
                            text: param
                        };
                    })
                });
            }

            console.log({
                url: url,
                body: body,
                auth: WhatsappUtilities.makeAuthorization(token)
            });
            const response: any = await axios.post(url, body, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log(error);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }
}

export interface SendTemplateMessageParameters {
    wppName: string;
    headerParams?: Array<string>;
    textParams?: Array<string>;
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
    text: string;
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
