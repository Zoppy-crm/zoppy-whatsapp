import { UnprocessableEntityException } from '@nestjs/common';
import { ApiErrorMessages, MessageTemplateUtil, StringUtil, WhatsappConstants } from '@ZoppyTech/utilities';
import axios from 'axios';
import { WhatsappRoutes } from '../util/whatsapp-routes';
import { BusinessMessageTemplatesResponse, MessageTemplatesComponentResponse } from '../response/business-message-templates.response';
import { WhatsappUtilities } from '../util/whatsapp-utilities';

export class WhatsappMessageTemplateService {
    public static async findByName(wabaId: string, token: string, templateName: string): Promise<BusinessMessageTemplatesResponse> {
        try {
            const url: string = WhatsappRoutes.getMessageTemplatesUrl(wabaId);
            const response: any = await axios.get(`${url}?name=${templateName}`, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log(error.body);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }

    public static async findById(wabaId: string, token: string, wppId: string): Promise<BusinessMessageTemplatesResponse> {
        try {
            const url: string = WhatsappRoutes.getMessageTemplatesUrl(wabaId);
            const response: any = await axios.get(`${url}/${wppId}`, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log(error.body);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }

    public static async list(wabaId: string, token: string): Promise<BusinessMessageTemplatesResponse[]> {
        try {
            const url: string = WhatsappRoutes.getMessageTemplatesUrl(wabaId);
            const response: any = await axios.get(url, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log(error.body);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }

    public static async create(
        wabaId: string,
        token: string,
        params: UpsertTemplateMessageParameters
    ): Promise<BusinessMessageTemplatesResponse> {
        try {
            const body: BusinessMessageTemplatesResponse = this.makeWppTemplateBody(params);
            const url: string = WhatsappRoutes.getMessageTemplatesUrl(wabaId);
            console.log({
                method: 'create',
                body: JSON.stringify(body),
                url: url,
                token: token
            });
            const response: any = await axios.post(url, body, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log(error);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }

    public static async update(
        wabaId: string,
        token: string,
        wppId: string,
        params: UpsertTemplateMessageParameters
    ): Promise<BusinessMessageTemplatesResponse> {
        try {
            const body: BusinessMessageTemplatesResponse = this.makeWppTemplateBody(params);
            const url: string = `${WhatsappRoutes.getMessageTemplatesUrl(wabaId)}/${wppId}`;
            console.log({
                method: 'update',
                body: JSON.stringify(body),
                url: url,
                token: token
            });
            const response: any = await axios.post(url, body, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log(error.body);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }

    public static async delete(wabaId: string, token: string, wppName: string): Promise<BusinessMessageTemplatesResponse> {
        try {
            const url: string = `${WhatsappRoutes.getMessageTemplatesUrl(wabaId)}?name=${wppName}`;
            console.log({
                method: 'delete',
                url: url,
                token: token
            });
            const response: any = await axios.delete(url, WhatsappUtilities.makeAuthorization(token));
            return response.data;
        } catch (error: any) {
            console.log(error);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }
    }

    private static makeWppTemplateBody(params: UpsertTemplateMessageParameters): BusinessMessageTemplatesResponse {
        const body: BusinessMessageTemplatesResponse = {
            category: 'MARKETING',
            language: WhatsappConstants.LANGUAGE_CODES.PT_BR,
            name: params.name,
            components: [
                {
                    type: 'BODY',
                    text: MessageTemplateUtil.replaceTemplateParameters(params.text)
                }
            ]
        };

        const bodyParams: string[] = MessageTemplateUtil.extractTemplateParameters(params.text).map((param: string) =>
            MessageTemplateUtil.findParameterExampleTextForWhatsapp(param)
        );

        if (bodyParams?.length > 0) {
            body.components[0].example = {
                body_text: [bodyParams]
            };
        }

        if (params.ctaLabel) {
            body.components.push({
                type: 'BUTTONS',
                buttons: [
                    {
                        type: 'URL',
                        text: params.ctaLabel,
                        url: params.ctaLink
                    }
                ]
            });
        }

        if (params.footerMessage) {
            body.components.push({
                type: 'FOOTER',
                text: params.footerMessage
            });
        }

        if (!params.headerMessage) return body;

        if (params.type === WhatsappConstants.MESSAGE_TEMPLATES.HEADER_TYPES.TEXT) {
            const headerComponent: MessageTemplatesComponentResponse = {
                type: 'HEADER',
                text: MessageTemplateUtil.replaceTemplateParameters(params.headerMessage),
                format: 'TEXT'
            };

            const headerParams: string[] = MessageTemplateUtil.extractTemplateParameters(params.headerMessage).map((param: string) =>
                MessageTemplateUtil.findParameterExampleTextForWhatsapp(param)
            );

            if (headerParams?.length > 0) {
                headerComponent.example = {
                    header_text: headerParams
                };
            }

            body.components.push(headerComponent);
        } else if (params.type === WhatsappConstants.MESSAGE_TEMPLATES.HEADER_TYPES.IMAGE) {
            const headerComponent: MessageTemplatesComponentResponse = {
                type: 'HEADER',
                parameters: [
                    {
                        type: 'image',
                        image: {
                            link: `${process.env.API_URL}/api/download/wpp-message-templates/${params.wppMessageTemplateId}/header`
                        }
                    }
                ]
            };
            body.components.push(headerComponent);
        } else if (params.type === WhatsappConstants.MESSAGE_TEMPLATES.HEADER_TYPES.VIDEO) {
            const headerComponent: MessageTemplatesComponentResponse = {
                type: 'HEADER',
                parameters: [
                    {
                        type: 'video',
                        video: {
                            link: `${process.env.API_URL}/api/download/wpp-message-templates/${params.wppMessageTemplateId}/header`
                        }
                    }
                ]
            };
            body.components.push(headerComponent);
        }

        return body;
    }
}

export interface UpsertTemplateMessageParameters {
    name: string;
    wppId?: string;
    footerMessage?: string;
    headerMessage?: string;
    text?: string;
    ctaLabel?: string;
    ctaLink?: string;
    type: string;
    wppMessageTemplateId: string;
}
