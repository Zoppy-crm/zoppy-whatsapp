import {
    Address,
    Company,
    MessageTemplate,
    MessageTemplateGroup,
    WhatsappMessageTemplate,
    WppAccount,
    WppAccountPhoneNumber,
    WppContact,
    WppConversation,
    WppMessage
} from '@ZoppyTech/models';
import {
    ApiErrorMessages,
    MessageTemplateUtil,
    PhoneNumberSliced,
    StringUtil,
    WhatsappConstants,
    WhatsappUtil
} from '@ZoppyTech/utilities';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TemplateFetchEntitiesHelper, TemplateFetchEntitiesHelperResponse } from './template-fetch-entities.helper';
import { TextMessageResponse } from '../response/text-message.response';
import { WhatsappMessageService } from '../service/whatsapp-message.service';

export class WhatsappNotificationHelper {
    public static async send(params: Parameters): Promise<WppMessage> {
        const address: Address = await Address.findOne({
            where: {
                companyId: params.company.id,
                phone: WhatsappUtil.getPhoneWithoutCountryCode(params.phone, true)
            }
        });

        if (!address) return;

        const messageTemplateGroup: MessageTemplateGroup = await MessageTemplateGroup.findOne({
            where: {
                companyId: params.company.id,
                identifier: params.identifier
            }
        });

        if (!messageTemplateGroup) throw new UnprocessableEntityException('Template não encontrado');

        const messageTemplate: MessageTemplate = await MessageTemplate.findOne({
            where: {
                companyId: params.company.id,
                messageTemplateGroupId: messageTemplateGroup.id
            }
        });
        if (!messageTemplate) throw new UnprocessableEntityException('Template não encontrado');

        const wppMessageTemplate: WhatsappMessageTemplate = await WhatsappMessageTemplate.findOne({
            where: {
                companyId: params.company.id,
                messageTemplateGroupId: messageTemplateGroup.id
            }
        });

        if (!wppMessageTemplate || wppMessageTemplate.status !== WhatsappConstants.MESSAGE_TEMPLATES.STATUS.APPROVED)
            throw new UnprocessableEntityException('Template não aprovado');

        const whatsappAccount: WppAccount = await WppAccount.findOne({
            where: {
                companyId: params.company.id
            }
        });
        if (!whatsappAccount) throw new NotFoundException(ApiErrorMessages.WHATSAPP_ACCOUNT_NOT_FOUND_OR_DELETED);

        const whatsappPhoneNumber: WppAccountPhoneNumber = await WppAccountPhoneNumber.findOne({
            where: {
                companyId: params.company.id,
                default: true
            }
        });
        if (!whatsappPhoneNumber) throw new NotFoundException(ApiErrorMessages.WHATSAPP_ACCOUNT_PHONE_NUMBER_NOT_FOUND_OR_DELETED);

        const contactPhoneSliced: PhoneNumberSliced = WhatsappUtil.slicePhone(params.phone);
        let whatsappContact: WppContact = await WppContact.findOne({
            where: {
                companyId: params.company.id,
                phone: contactPhoneSliced.getPhoneWithoutCountryCode()
            }
        });

        if (!whatsappContact) {
            whatsappContact = await WppContact.create(
                WppContact.build({
                    id: StringUtil.generateUuid(),
                    companyId: params.company.id,
                    firstName: address.firstName,
                    lastName: address.lastName,
                    countryCode: contactPhoneSliced.countryCode,
                    subdivisionCode: contactPhoneSliced.subdivisionCode,
                    phone: contactPhoneSliced.getPhoneWithoutCountryCode(),
                    isBlocked: false,
                    gdprTermsSentAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }).get()
            );
        }

        if (whatsappContact.isBlocked) return;

        const latestConversation: WppConversation = await WppConversation.findOne({
            where: {
                wppContactId: whatsappContact.id,
                companyId: params.company.id
            },
            order: [['createdAt', 'DESC']]
        });
        if (!latestConversation || !!latestConversation.finishedAt) {
            const newConversation: WppConversation = WppConversation.build({
                id: StringUtil.generateUuid(),
                ticket: StringUtil.generateUuid(),
                sessionExpiration: latestConversation?.sessionExpiration ?? null,
                wppContactId: whatsappContact.id,
                wppManagerId: null,
                companyId: params.company.id,
                finishedAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await WppConversation.create(newConversation.get());
        }

        const parameterEntities: TemplateFetchEntitiesHelperResponse = await TemplateFetchEntitiesHelper.execute({
            addressId: address.id,
            orderId: params.orderId,
            companyId: params.company.id,
            code: params.couponCode
        });

        const headerParamValues: string[] = MessageTemplateUtil.extractTemplateParameters(wppMessageTemplate.headerMessage).map(
            (param: string) => MessageTemplateUtil.getParameterValue(param, parameterEntities)
        );
        const bodyParamValues: string[] = MessageTemplateUtil.extractTemplateParameters(messageTemplate.text).map((param: string) =>
            MessageTemplateUtil.getParameterValue(param, parameterEntities)
        );

        const whatsappMessageSent: TextMessageResponse = await WhatsappMessageService.sendTemplateMessage(
            whatsappPhoneNumber.phoneNumberId,
            contactPhoneSliced.getFullPhone(),
            whatsappAccount.accessToken,
            {
                wppName: wppMessageTemplate.wppName,
                headerParams: headerParamValues,
                textParams: bodyParamValues
            }
        );

        const newMessage: WppMessage = WppMessage.build({
            id: StringUtil.generateUuid(),
            companyId: params.company.id,
            content: MessageTemplateUtil.replaceParameters(messageTemplate.text, parameterEntities),
            headerContent: MessageTemplateUtil.replaceParameters(wppMessageTemplate.headerMessage, parameterEntities),
            footerContent: wppMessageTemplate.footerMessage,
            ctaLabel: wppMessageTemplate.ctaLabel,
            ctaLink: wppMessageTemplate.ctaLink,
            type: WhatsappConstants.MESSAGE_TYPES.TEMPLATE,
            status: WhatsappConstants.MESSAGE_STATUS.SENT,
            origin: WhatsappConstants.MESSAGE_ORIGINS.BUSINESS_INITIATED,
            wppContactId: whatsappContact.id,
            wppPhoneNumberId: whatsappPhoneNumber.id,
            wppManagerId: null,
            messageTemplateGroupId: messageTemplateGroup.id,
            wamId: whatsappMessageSent?.messages.pop().id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return await WppMessage.create(newMessage.get());
    }
}

interface Parameters {
    phone: string;
    identifier: string;
    company: Company;
    orderId: string;
    couponCode: string;
}
