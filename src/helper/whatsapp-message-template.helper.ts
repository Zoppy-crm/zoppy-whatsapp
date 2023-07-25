import {
    Address,
    Company,
    Coupon,
    Customer,
    MessageTemplate,
    MessageTemplateGroup,
    Order,
    User,
    WppAccount,
    WppAccountPhoneNumber,
    WppContact,
    WppMessage,
    WppMessageTemplate
} from '@ZoppyTech/models';
import {
    ApiErrorMessages,
    MessageTemplateConstants,
    MessageTemplateUtil,
    StringUtil,
    WcStatusConstants,
    WhatsappConstants,
    WhatsappUtil
} from '@ZoppyTech/utilities';

import { NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { SyncGroupWhatsappRequest } from '../request/sync-group-whatsapp.request';
import { BusinessMessageTemplatesResponse } from '../response/business-message-templates.response';
import { TextMessageResponse } from '../response/text-message.response';
import { LogService } from '../service/log/log.service';
import { UpsertTemplateMessageParameters, WhatsappMessageTemplateService } from '../service/whatsapp-message-template.service';
import { WhatsappMessageService } from '../service/whatsapp-message.service';
import { TemplateFetchEntitiesHelper, TemplateFetchEntitiesHelperResponse } from './template-fetch-entities.helper';

export class WhatsappMessageTemplateHelper {
    public static async sync(wppAccount: WppAccount): Promise<BusinessMessageTemplatesResponse[]> {
        const response: BusinessMessageTemplatesResponse[] = [];
        if (!wppAccount || !wppAccount.active) return response;

        const company: Company = await Company.findByPk(wppAccount.companyId);

        const groups: MessageTemplateGroup[] = await MessageTemplateGroup.findAll({
            where: {
                companyId: company.id
            }
        });

        for (const group of groups) {
            const wppMessageTemplate: WppMessageTemplate = await WppMessageTemplate.findOne({
                where: {
                    messageTemplateGroupId: group.id,
                    companyId: company.id
                },
                order: [['createdAt', 'DESC']]
            });

            if (wppMessageTemplate) continue;

            const templates: MessageTemplate[] = await MessageTemplate.findAll({
                where: {
                    messageTemplateGroupId: group.id,
                    companyId: company.id
                },
                order: [['position', 'ASC']]
            });

            const concatMessage: string = templates.map((template: MessageTemplate) => template.text).join(`\n\n`);

            for (const template of templates)
                MessageTemplate.destroy({
                    where: {
                        id: template.id
                    }
                });

            const newTemplate: MessageTemplate = await MessageTemplate.create({
                id: StringUtil.generateUuid(),
                text: concatMessage,
                position: 0,
                messageTemplateGroupId: group.id,
                parameters: MessageTemplateUtil.extractTemplateParameters(concatMessage),
                companyId: company.id,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const wppTemplate: BusinessMessageTemplatesResponse = await this.createWppTemplate({
                group: group,
                template: newTemplate,
                wppAccount: wppAccount,
                company: company
            });
            response.push(wppTemplate);
        }

        return response;
    }

    public static async createWppTemplate(params: UpsertTemplateParameters): Promise<BusinessMessageTemplatesResponse> {
        const wppName: string = StringUtil.makeId(32, true);

        if (!params.createWppMessageTemplateId) params.createWppMessageTemplateId = StringUtil.generateUuid();

        const body: UpsertTemplateMessageParameters = {
            name: wppName,
            footerMessage: params.request?.footerMessage,
            headerMessage: params.request?.headerMessage,
            wppMessageTemplateId: params.createWppMessageTemplateId,
            text: params.template.text,
            ctaLabel: params.request?.ctaLabel,
            ctaLink: params.request?.ctaLink,
            type: params.request?.type,
            headerHandle: params.request?.headerHandle
        };

        const response: BusinessMessageTemplatesResponse = await WhatsappMessageTemplateService.create(
            params.wppAccount.wabaId,
            params.wppAccount.accessToken,
            body
        );

        const isVisible: boolean = [
            MessageTemplateConstants.DEFAULT_IDENTIFIERS.CONTACT,
            MessageTemplateConstants.DEFAULT_IDENTIFIERS.HOUR_SERVICE_MENSAGE
        ].includes(params.group.identifier)
            ? true
            : params.request?.visible;

        const whatsappMessageTemplate: WppMessageTemplate = WppMessageTemplate.build({
            id: params.createWppMessageTemplateId,
            wppId: response.id,
            wppName: wppName,
            headerParams: params.request?.headerMessage ? MessageTemplateUtil.extractTemplateParameters(params.request.headerMessage) : [],
            headerMessage: params.request?.headerMessage,
            footerMessage: params.request?.footerMessage,
            ctaLabel: params.request?.ctaLabel,
            ctaLink: params.request?.ctaLink,
            type: params.request?.type,
            status: response.status,
            visible: isVisible,
            messageTemplateGroupId: params.group.id,
            companyId: params.company.id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await WppMessageTemplate.create({ ...whatsappMessageTemplate.get() });

        return response;
    }

    public static async updateWppTemplate(params: UpsertTemplateParameters): Promise<BusinessMessageTemplatesResponse> {
        const wppName: string = StringUtil.makeId(32, true);

        try {
            await WhatsappMessageTemplateService.delete(
                params.wppAccount.wabaId,
                params.wppAccount.accessToken,
                params.wppTemplate.wppName
            );
        } catch (ex) {
            await LogService.error({
                company: params.company,
                message: {
                    message: 'Error when deleting template',
                    err: ex
                }
            });
        }

        const body: UpsertTemplateMessageParameters = {
            name: wppName,
            footerMessage: params.request?.footerMessage,
            headerMessage: params.request?.headerMessage,
            text: params.template.text,
            ctaLabel: params.request?.ctaLabel,
            ctaLink: params.request?.ctaLink,
            type: params.request?.type,
            wppMessageTemplateId: params.wppTemplate.id,
            headerHandle: params.request.headerHandle
        };

        const response: BusinessMessageTemplatesResponse = await WhatsappMessageTemplateService.create(
            params.wppAccount.wabaId,
            params.wppAccount.accessToken,
            body
        );

        await WppMessageTemplate.update(
            {
                wppId: response.id,
                wppName: wppName,
                headerParams: params.request?.headerMessage
                    ? MessageTemplateUtil.extractTemplateParameters(params.request.headerMessage)
                    : [],
                headerMessage: params.request?.headerMessage,
                footerMessage: params.request?.footerMessage,
                ctaLabel: params.request?.ctaLabel,
                ctaLink: params.request?.ctaLink,
                status: response.status,
                type: params.request?.type,
                visible: params.request?.visible,
                messageTemplateGroupId: params.group.id,
                updatedAt: new Date()
            },
            {
                where: {
                    id: params.wppTemplate.id
                }
            }
        );

        return response;
    }

    public static async sendDefaultTemplateMessage(params: SendTemplateParams): Promise<WppMessage> {
        const accountCredentials: WppAccountPhoneNumber = await WppAccountPhoneNumber.findOne({
            where: {
                phoneNumberId: params.wppPhoneNumberId,
                companyId: params.company.id
            },
            include: [
                {
                    model: WppAccount,
                    where: {
                        active: true
                    },
                    required: true
                }
            ]
        });
        if (!accountCredentials) throw new NotFoundException(ApiErrorMessages.WHATSAPP_ACCOUNT_NOT_FOUND_OR_DELETED);

        let address: Address = await Address.findOne({
            where: {
                phone: WhatsappUtil.getPhoneWithoutCountryCode(params.contactFound.phone),
                companyId: params.company.id
            }
        });
        let customer: Customer = null;
        if (!address) {
            address = await Address.create({
                id: StringUtil.generateUuid(),
                phone: WhatsappUtil.getPhoneWithoutCountryCode(params.contactFound.phone),
                firstName: params.contactFound.firstName,
                lastName: params.contactFound.lastName,
                createdAt: new Date(),
                updatedAt: new Date(),
                companyId: params.company.id
            });

            customer = await Customer.create({
                id: StringUtil.generateUuid(),
                firstName: params.contactFound.firstName,
                lastName: params.contactFound.lastName,
                billingId: address.id,
                shippingId: address.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                companyId: params.company.id
            });
        } else {
            customer = await Customer.findOne({
                where: {
                    billingId: address.id,
                    companyId: params.company.id
                }
            });
        }

        const order: Order = await Order.findOne({
            where: {
                status: {
                    [Op.eq]: WcStatusConstants.COMPLETED
                }
            },
            include: [
                {
                    model: Address,
                    required: true,
                    where: {
                        phone: address.phone
                    }
                }
            ],
            order: [['completedAt', 'ASC']]
        });
        const coupon: Coupon = await Coupon.findOne({
            where: {
                used: {
                    [Op.not]: true
                },
                companyId: params.company.id,
                expiryDate: {
                    [Op.gte]: new Date()
                },
                phone: address.phone
            },
            order: [['createdAt', 'DESC']]
        });

        const parameterEntities: TemplateFetchEntitiesHelperResponse = await TemplateFetchEntitiesHelper.execute({
            addressId: address.id,
            orderId: order?.id,
            companyId: params.company.id,
            code: coupon?.code,
            userId: params.user?.id,
            address: address,
            customer: customer
        });

        const messageTemplateGroup: MessageTemplateGroup = await MessageTemplateGroup.findOne({
            where: {
                identifier: params.identifier,
                companyId: params.company.id
            }
        });

        if (!messageTemplateGroup) throw new NotFoundException(ApiErrorMessages.WHATSAPP_MESSAGE_TEMPLATE_NOT_FOUND_OR_DELETED);

        const wppMessageTemplate: WppMessageTemplate = await WppMessageTemplate.findOne({
            where: {
                messageTemplateGroupId: messageTemplateGroup.id,
                companyId: params.company.id
            }
        });

        if (!wppMessageTemplate) throw new NotFoundException(ApiErrorMessages.WHATSAPP_MESSAGE_TEMPLATE_NOT_FOUND_OR_DELETED);

        const messageTemplate: MessageTemplate = await MessageTemplate.findOne({
            where: {
                messageTemplateGroupId: wppMessageTemplate.messageTemplateGroupId,
                companyId: params.company.id
            }
        });

        if (!messageTemplate) throw new NotFoundException(ApiErrorMessages.WHATSAPP_MESSAGE_TEMPLATE_NOT_FOUND_OR_DELETED);

        const headerParamValues: string[] = MessageTemplateUtil.extractTemplateParameters(wppMessageTemplate.headerMessage).map(
            (param: string) => MessageTemplateUtil.getParameterValue(param, parameterEntities)
        );
        const bodyParamValues: string[] = MessageTemplateUtil.extractTemplateParameters(messageTemplate.text).map((param: string) =>
            MessageTemplateUtil.getParameterValue(param, parameterEntities)
        );

        const whatsappMessageSent: TextMessageResponse = await WhatsappMessageService.sendTemplateMessage(
            accountCredentials.phoneNumberId,
            WhatsappUtil.getFullPhone(address.phone),
            accountCredentials.wppAccount.accessToken,
            {
                wppName: wppMessageTemplate.wppName,
                headerParams: headerParamValues,
                textParams: bodyParamValues,
                headerType: wppMessageTemplate.type,
                fileUrl: `${process.env.API_URL}/api/download/wpp-message-templates/${wppMessageTemplate.id}/header`,
                hasHeader: !!wppMessageTemplate.headerMessage
            }
        );

        const newMessage: WppMessage = WppMessage.build({
            id: StringUtil.generateUuid(),
            content: messageTemplate.text,
            type: WhatsappConstants.MESSAGE_TYPES.TEMPLATE,
            status: WhatsappConstants.MESSAGE_STATUS.SENT,
            origin: WhatsappConstants.MESSAGE_ORIGINS.BUSINESS_INITIATED,
            wppContactId: params.contactFound.id,
            wppPhoneNumberId: accountCredentials.id,
            wppManagerId: null,
            messageTemplateGroupId: messageTemplateGroup.id,
            wamId: whatsappMessageSent.messages.pop().id,
            companyId: params.company.id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return await WppMessage.create(newMessage.get());
    }
}

interface UpsertTemplateParameters {
    group: MessageTemplateGroup;
    template: MessageTemplate;
    wppAccount: WppAccount;
    wppTemplate?: WppMessageTemplate;
    request?: SyncGroupWhatsappRequest;
    company: Company;
    createWppMessageTemplateId?: string;
}

interface SendTemplateParams {
    identifier: string;
    wppPhoneNumberId: string;
    contactFound: WppContact;
    company: Company;
    user?: User;
}
