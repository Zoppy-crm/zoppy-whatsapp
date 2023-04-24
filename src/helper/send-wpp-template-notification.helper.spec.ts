import {
    Company,
    Address,
    WppAccount,
    WppAccountPhoneNumber,
    MessageTemplateGroup,
    MessageTemplate,
    WhatsappMessageTemplate,
    WppMessage,
    Order,
    Coupon,
    User
} from '@ZoppyTech/models';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestUtils } from '@ZoppyTech/test-utils';
import { WhatsappMessageService } from '../service/whatsapp-message.service';
import { AppConstants, MessageTemplateConstants, MessageTemplateUtil, StringUtil, WhatsappConstants } from '@ZoppyTech/utilities';
import { SendWppTemplateNotificationHelper } from './send-wpp-template-notification.helper';

describe(`Whatsapp Notification Helper`, () => {
    let app: INestApplication;
    let company: Company;
    let address: Address;
    let order: Order;
    let coupon: Coupon;

    beforeAll(async () => {
        await TestUtils.setSequelize();
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [],
            imports: []
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
        company = await Company.findOne();
        await User.create({
            id: StringUtil.generateUuid(),
            name: 'Lucas',
            userName: 'lucas.roscoe@zoppy.com.br',
            nickName: 'Lucas',
            email: 'lucas.roscoe@zoppy.com.br',
            role: AppConstants.ROLES.ADMIN,
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: company.id
        });

        WhatsappMessageService.sendTemplateMessage = jest.fn().mockReturnValue({
            messaging_product: 'whatsapp',
            contacts: [
                {
                    input: '5531998085147',
                    wa_id: '553198085147'
                }
            ],
            messages: [
                {
                    id: 'wamid.HBgMNTUzMTk4MDg1MTQ3FQIAERgSOTA1NjU0NzU1QjE3M0MzQURFAA=='
                }
            ]
        });
        const wppAccount: WppAccount = await WppAccount.create({
            id: StringUtil.generateUuid(),
            businessName: 'businessName',
            description: 'description',
            scenario: 'scenario',
            wabaId: 'wabaId',
            appId: 'appId',
            accessToken: 'accessToken',
            webhookVerifyToken: 'webhookVerifyToken',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: company.id
        });

        await WppAccountPhoneNumber.create({
            id: StringUtil.generateUuid(),
            fullPhone: '5515550491226',
            status: 'NOT_VERIFIED',
            qualityRating: 'GREEN',
            default: true,
            businessHoursEnabled: false,
            phoneNumberId: '108448215272951',
            wppAccountId: wppAccount.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: company.id
        });

        order = await Order.findOne({
            where: {
                companyId: company.id
            }
        });

        address = await Address.findOne({
            where: {
                companyId: company.id,
                id: order.billingId
            }
        });

        await Address.update(
            {
                phone: '31998085147'
            },
            {
                where: {
                    id: address.id
                }
            }
        );

        await Company.update(
            {
                socialName: 'Zoppy'
            },
            {
                where: {
                    id: company.id
                }
            }
        );

        coupon = await Coupon.findOne({
            where: {
                companyId: company.id
            }
        });
    });

    it(`Should send notification correctly`, async () => {
        const messageTemplateGroup: MessageTemplateGroup = await MessageTemplateGroup.create({
            id: StringUtil.generateUuid(),
            name: 'batata',
            identifier: 'identifier',
            type: 'whatsapp',
            description: 'description',
            default: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: company.id
        });
        const message: string = `Oii {{${MessageTemplateConstants.PARAMETERS.CLIENT_FIRST_NAME}}}, tudo bem?
Aqui é a {{${MessageTemplateConstants.PARAMETERS.SELLER_NAME}}}, da {{${MessageTemplateConstants.PARAMETERS.COMPANY_NAME}}}!

Vi aqui que você não finalizou a compra dos produtos: {{${MessageTemplateConstants.PARAMETERS.PRODUCT_LIST}}}!

Tô vindo te chamar pra saber se consigo ajudar com algo e me colocar à disposição pra qualquer dúvida!

{{${MessageTemplateConstants.PARAMETERS.STORE_URL}}}`;
        const headerMessage: string = `Olá {{${MessageTemplateConstants.PARAMETERS.CLIENT_FIRST_NAME}}}, tudo bem?
Aqui é o {{${MessageTemplateConstants.PARAMETERS.SELLER_NAME}}}, da {{${MessageTemplateConstants.PARAMETERS.COMPANY_NAME}}}, estou te chamando pra saber como foi sua experiência com a gente e se posso ajudar em algo!

Um abraço!`;
        await MessageTemplate.create({
            id: StringUtil.generateUuid(),
            messageTemplateGroupId: messageTemplateGroup.id,
            position: 0,
            text: message,
            parameters: MessageTemplateUtil.extractTemplateParameters(message),
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: company.id
        });
        await WhatsappMessageTemplate.create({
            id: StringUtil.generateUuid(),
            messageTemplateGroupId: messageTemplateGroup.id,
            wppId: '12345',
            wppName: 'whatsapp_template_name',
            headerParams: MessageTemplateUtil.extractTemplateParameters(headerMessage),
            headerMessage: headerMessage,
            footerMessage: 'footerMessage',
            ctaLabel: 'ctaLabel',
            ctaLink: 'ctaLink',
            status: WhatsappConstants.MESSAGE_TEMPLATES.STATUS.APPROVED,
            visible: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: company.id
        });
        const response: WppMessage = await SendWppTemplateNotificationHelper.send({
            phone: '31998085147',
            identifier: messageTemplateGroup.identifier,
            company: company,
            orderId: order.id,
            couponCode: coupon.code
        });

        expect(response.content).toBeTruthy();
        expect(response.headerContent).toBeTruthy();
        expect(response.footerContent).toBeTruthy();
        expect(response.ctaLabel).toBeTruthy();
        expect(response.ctaLink).toBeTruthy();
        expect(response.wamId).toBeTruthy();
    });
});
