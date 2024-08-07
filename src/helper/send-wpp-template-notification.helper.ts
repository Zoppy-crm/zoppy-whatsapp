import {
    Address,
    Company,
    MessageTemplate,
    MessageTemplateGroup,
    WppMessageTemplate,
    WppAccount,
    WppAccountPhoneNumber,
    WppContact,
    WppMessage,
    WppConversation
} from '@ZoppyTech/models';
import {
    ApiErrorMessages,
    PhoneNumberSliced,
    StringUtil,
    WhatsappConstants,
    WhatsappUtil,
    MessageTemplateParameterEntities,
    MessageTemplateUtil
} from '@ZoppyTech/utilities';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TextMessageResponse } from '../response/text-message.response';
import { WhatsappMessageService } from '../service/whatsapp-message.service';
import { WhatsappUtilities } from '../util/whatsapp-utilities';
import { MessageTemplateHelper } from '@ZoppyTech/shared';
import { LogService } from '@ZoppyTech/logger';

export class SendWppTemplateNotificationHelper {
    public static async send(params: Parameters): Promise<WppMessage> {
        const address: Address = await Address.findOne({
            where: { companyId: params.company.id, phone: WhatsappUtil.getPhoneWithoutCountryCode(params.phone, true) }
        });

        await LogService.info({ message: { message: 'Found Address to send Wpp Template Notification', address: address?.get() } });

        if (!address) return;

        const messageTemplateGroup: MessageTemplateGroup = params.messageTemplateGroupId
            ? await MessageTemplateGroup.findOne({ where: { companyId: params.company.id, id: params.messageTemplateGroupId } })
            : await MessageTemplateGroup.findOne({ where: { companyId: params.company.id, identifier: params.identifier } });

        await LogService.info({
            message: {
                message: 'Found Template Group',
                address: messageTemplateGroup?.get()
            }
        });

        if (!messageTemplateGroup) throw new UnprocessableEntityException('Template não encontrado');

        const messageTemplates: MessageTemplate[] = await MessageTemplate.findAll({
            where: { companyId: params.company.id, messageTemplateGroupId: messageTemplateGroup.id }
        });
        if (!messageTemplates.length) throw new UnprocessableEntityException('Template não encontrado');

        await LogService.info({ message: { message: 'Found Template', address: messageTemplateGroup?.get() } });

        const wppMessageTemplate: WppMessageTemplate = await WppMessageTemplate.findOne({
            where: { companyId: params.company.id, messageTemplateGroupId: messageTemplateGroup.id }
        });

        await LogService.info({ message: { message: 'Found Wpp Template', address: messageTemplateGroup?.get() } });

        if (!wppMessageTemplate || wppMessageTemplate.status !== WhatsappConstants.MESSAGE_TEMPLATES.STATUS.APPROVED)
            throw new UnprocessableEntityException('Template não aprovado');

        const whatsappAccount: WppAccount = await WppAccount.findOne({ where: { companyId: params.company.id } });
        if (!whatsappAccount) throw new NotFoundException(ApiErrorMessages.WHATSAPP_ACCOUNT_NOT_FOUND_OR_DELETED);

        const whatsappPhoneNumber: WppAccountPhoneNumber = await WppAccountPhoneNumber.findOne({
            where: { companyId: params.company.id, default: true }
        });
        if (!whatsappPhoneNumber) throw new NotFoundException(ApiErrorMessages.WHATSAPP_ACCOUNT_PHONE_NUMBER_NOT_FOUND_OR_DELETED);

        const contactPhoneSliced: PhoneNumberSliced = WhatsappUtil.slicePhone(params.phone);
        let whatsappContact: WppContact = await WppContact.findOne({
            where: { companyId: params.company.id, phone: contactPhoneSliced.getPhoneWithoutCountryCode() }
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

        if (whatsappContact.isBlocked)
            throw new NotFoundException(ApiErrorMessages.WHATSAPP_CONTACT_FORBIDDEN_TO_SEND_MESSAGES_TO_THIS_CONTACT);

        await LogService.info({
            message: {
                message: 'Found Wpp Contact',
                address: whatsappContact?.get()
            }
        });

        let latestConversation: WppConversation = await WppConversation.findOne({
            where: { wppContactId: whatsappContact.id, companyId: params.company.id },
            order: [['createdAt', 'DESC']]
        });
        if (!latestConversation) {
            latestConversation = await WppConversation.create(
                WppConversation.build({
                    id: StringUtil.generateUuid(),
                    ticket: StringUtil.generateUuid(),
                    sessionExpiration: WhatsappUtilities.makeNewSessionTimestamp(),
                    wppContactId: whatsappContact.id,
                    wppManagerId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    finishedAt: new Date(),
                    companyId: params.company.id
                }).get()
            );
        }

        const parameterEntities: MessageTemplateParameterEntities = await MessageTemplateHelper.fetchEntities({
            addressId: address.id,
            orderId: params.orderId,
            abandonedCartId: params.abandonedCartId,
            companyId: params.company.id,
            code: params.couponCode
        });

        await LogService.info({
            message: {
                message: 'Wpp Template Parameters',
                address: parameterEntities
            }
        });

        await LogService.info({
            message: {
                message: 'Parameters',
                params: MessageTemplateUtil.extractTemplateParameters(wppMessageTemplate.headerMessage)
            }
        });

        const concatMessage: string = messageTemplates.map((template: MessageTemplate) => template.text).join(`\n\n`);

        const headerParamValues: string[] = MessageTemplateUtil.extractTemplateParameters(wppMessageTemplate.headerMessage).map(
            (param: string) => MessageTemplateUtil.getParameterValue(param, parameterEntities)
        );
        const bodyParamValues: string[] = MessageTemplateUtil.extractTemplateParameters(concatMessage).map((param: string) =>
            MessageTemplateUtil.getParameterValue(param, parameterEntities)
        );

        await LogService.info({
            message: {
                message: 'Parameter Values',
                headerParamValues: headerParamValues,
                bodyParamValues: bodyParamValues
            }
        });

        const whatsappMessageSent: TextMessageResponse = await WhatsappMessageService.sendTemplateMessage(
            whatsappPhoneNumber.phoneNumberId,
            contactPhoneSliced.getFullPhone(),
            whatsappAccount.accessToken,
            {
                wppName: wppMessageTemplate.wppName,
                headerParams: headerParamValues,
                textParams: bodyParamValues,
                headerType: wppMessageTemplate.type,
                fileUrl: `https://${process.env.API_DOMAIN}/api/download/wpp-message-templates/${wppMessageTemplate.id}/header`,
                hasHeader: !!wppMessageTemplate.headerMessage
            }
        );

        const newMessage: WppMessage = WppMessage.build({
            id: StringUtil.generateUuid(),
            companyId: params.company.id,
            content: MessageTemplateUtil.replaceParameters(concatMessage, parameterEntities),
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

        await LogService.info({ message: { message: 'New Message created', address: newMessage } });

        return await WppMessage.create(newMessage.get());
    }
}

interface Parameters {
    messageTemplateGroupId: string;
    phone: string;
    identifier: string;
    company: Company;
    orderId: string;
    abandonedCartId: string;
    couponCode: string;
}
