import { TextMessageResponse } from '../response/text-message.response';
import axios from 'axios';
import { WhatsappRoutes } from '../util/whatsapp-routes';
import { WhatsappMessageTemplateService } from './whatsapp-message-template.service';
import { BusinessMessageTemplatesResponse } from '../response/business-message-templates.response';
import { ApiErrorMessages } from '@ZoppyTech/utilities';
import { UnprocessableEntityException } from '@nestjs/common';

export class WhatsappMessageService {
    public static async sendTemplateMessage(
        wabaId: string,
        token: string,
        params: SendTemplateMessageParameters
    ): Promise<TextMessageResponse> {
        try {
            const url: string = WhatsappRoutes.getMessagesUrl(wabaId);
            const template: BusinessMessageTemplatesResponse = await WhatsappMessageTemplateService.findById(wabaId, token, params.wppId);
        } catch (error: any) {
            console.log(error);
            throw new UnprocessableEntityException(ApiErrorMessages.WHATSAPP_SERVICE_SOMETHING_UNEXPECTED_HAPPENED_IN_WHATSAPP_CLOUD_API);
        }

        const url: string = WhatsappRoutes.getMessagesUrl(wabaId);

        return null;
    }
}

export interface SendTemplateMessageParameters {
    wppId?: string;
    footerText?: string;
    headerText?: string;
    headerParams?: Array<string>;
    text?: string;
    textParams?: Array<string>;
    ctaLabel?: string;
    ctaLink?: string;
}

export interface SendTemplateMessageBody {
    name: string;
    language: {
        code: string;
    };
    components: SendTemplateMessageComponentBody[];
}

export interface SendTemplateMessageComponentBody {
    type: string;
    sub_type?: string; //url | quick_reply
    index?: string;
    parameters: SendTemplateMessageComponentParameterBody[];
}

export interface SendTemplateMessageComponentParameterBody {
    type: string;
    image?: {
        link: string;
    };
    text?: string;
    payload?: string;
}
