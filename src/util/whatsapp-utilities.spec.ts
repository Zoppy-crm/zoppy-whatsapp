import { TestUtils } from '@ZoppyTech/test-utils';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappUtilities } from './whatsapp-utilities';

describe(`Whatsapp Utilities`, () => {
    let app: INestApplication;

    beforeAll(async () => {
        await TestUtils.setSequelize();
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [],
            imports: []
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });

    it(`Should format template body correctly`, async () => {
        const body: string =
            'Oi {{1}} ,\\n\n\nQueremos te contar em primeira mão o super presente de Dia dos namorados que preparamos!\\n\n\nPara deixar a experiência de autocuidado ainda mais completa e gostosa, nos unimos ao Namah Beauty 🤩!!\n\n\nE durante o mês de junho (ou enquanto durar os estoques), todas as compras no nosso site receberão de presente o shampoo e o condicionador sólidos do Namah!\n\n\nSua pele e seus cabelos agradecem!\n\n\nAproveite para garantir o seu e presentear quem você ama! 🤎\n';
        const result: string = WhatsappUtilities.formatTemplateBody(body);
        expect(result).toEqual(
            'Oi {{1}} ,\n \n \n Queremos te contar em primeira mão o super presente de Dia dos namorados que preparamos!\n \n \n Para deixar a experiência de autocuidado ainda mais completa e gostosa, nos unimos ao Namah Beauty 🤩!!\n \n \n E durante o mês de junho (ou enquanto durar os estoques), todas as compras no nosso site receberão de presente o shampoo e o condicionador sólidos do Namah!\n \n \n Sua pele e seus cabelos agradecem!\n \n \n Aproveite para garantir o seu e presentear quem você ama! 🤎\n '
        );
    });
});
