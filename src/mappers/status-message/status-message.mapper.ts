export class WhatsappStatusMessageMapper {
    public static async map(errorMessage: TranslatedStatusErrors): Promise<TranslatedStatusErrors> {
        const translatedErrors: StatusErrors = new StatusErrors();
        const statusErrors: Array<TranslatedStatusErrors> = translatedErrors.statusErrors;
        if (!errorMessage.errorCode) return errorMessage;

        const code: number = errorMessage.errorCode >= 200 && errorMessage.errorCode <= 299 ? 200 : errorMessage.errorCode;

        const error: TranslatedStatusErrors = statusErrors.find((statusError: TranslatedStatusErrors) => statusError.errorCode === code);

        return error
            ? {
                  errorCode: errorMessage.errorCode,
                  errorMessage: `(#${errorMessage.errorCode}) ${error.errorMessage}`,
                  errorDetails: error.errorDetails
              }
            : errorMessage;
    }
}

class StatusErrors {
    public statusErrors: Array<TranslatedStatusErrors> = [
        {
            errorCode: 0,
            errorMessage: 'Não foi possível autenticar o usuário do aplicativo.',
            errorDetails:
                'Normalmente, isso significa que o token de acesso incluído expirou, foi invalidado ou o usuário do aplicativo alterou uma configuração para impedir que todos os aplicativos acessem seus dados. Recomendamos que você obtenha um novo token de acesso.'
        },
        {
            errorCode: 3,
            errorMessage: 'Problema de capacidade ou permissões.',
            errorDetails:
                'Use o depurador de token de acesso para verificar se seu aplicativo recebeu as permissões exigidas pelo endpoint. Consulte Solução de problemas.'
        },
        {
            errorCode: 10,
            errorMessage: 'A permissão não foi concedida ou foi removida.',
            errorDetails:
                'Use o depurador de token de acesso para verificar se seu aplicativo recebeu as permissões exigidas pelo endpoint. Consulte Solução de problemas. Certifique-se de que o número de telefone usado para definir a chave pública comercial esteja na lista de permissões.'
        },
        {
            errorCode: 190,
            errorMessage: 'Seu token de acesso expirou.',
            errorDetails: 'Obtenha um novo token de acesso.'
        },
        {
            errorCode: 200,
            errorMessage: 'A permissão não foi concedida ou foi removida.',
            errorDetails:
                'Use o depurador de token de acesso para verificar se seu aplicativo recebeu as permissões exigidas pelo endpoint. Consulte Solução de problemas.'
        },

        {
            errorCode: 4,
            errorMessage: 'A conta comercial do WhatsApp atingiu seu limite de taxa.',
            errorDetails:
                'Carregue o aplicativo no App Dashboard e veja o limite de taxa de aplicação seção para verificar se o aplicativo atingiu seu limite de taxa. Se tiver, tente novamente mais tarde ou reduza a frequência ou quantidade de consultas de API no aplicativo está sendo feito.'
        },
        {
            errorCode: 80007,
            errorMessage: 'Problema de capacidade ou permissões.',
            errorDetails:
                'Veja a conta comercial do WhatsApp Limites de taxa. Tente novamente mais tarde ou reduza a frequência ou a quantidade de consultas de API que o aplicativo está fazendo.'
        },
        {
            errorCode: 130429,
            errorMessage: 'A taxa de transferência de mensagens da API Cloud foi atingida.',
            errorDetails:
                'O aplicativo atingiu a API limite de rendimento. Consulte Taxa de transferência. Tente novamente mais tarde ou reduza a frequência com o qual o aplicativo envia mensagens.'
        },
        {
            errorCode: 131048,
            errorMessage:
                'A mensagem não foi enviada porque há restrições quantas mensagens podem ser enviadas deste número de telefone. Isto pode ocorrer porque muitas mensagens anteriores foram bloqueado ou sinalizado como spam.',
            errorDetails:
                'Verifique seu status de qualidade no Gerenciador de WhatsApp e veja o Documentação de limites de taxa com base na qualidade Para maiores informações.'
        },
        {
            errorCode: 131056,
            errorMessage:
                'Muitas mensagens enviadas do número de telefone do remetente para o mesmo número de telefone do destinatário em um curto período de tempo.',
            errorDetails:
                'Aguarde e tente novamente a operação, caso pretenda enviar mensagens para o mesmo número de telefone. Você ainda pode enviar mensagens para um número de telefone diferente sem esperar'
        },
        {
            errorCode: 133016,
            errorMessage:
                'O registro ou cancelamento do registro falhou porque havia muitos muitas tentativas para esse número de telefone em um curto período de tempo',
            errorDetails:
                'O número de telefone comercial está sendo bloqueado porque tem atingiu seu registro/cancelamento de registro limite de tentativa. Tente novamente quando o número está desbloqueado. Consulte "Limitações" no Documento de registro.'
        },

        {
            errorCode: 368,
            errorMessage:
                'A conta comercial do WhatsApp associada com o aplicativo foi restringido ou desativado por violar uma política da plataforma.',
            errorDetails: 'Veja a aplicação da política documento para saber mais sobre a política violações e como resolvê-las.'
        },
        {
            errorCode: 131031,
            errorMessage:
                'A conta comercial do WhatsApp associada ao aplicativo foi restringido ou desativado por violar uma política da plataforma, ou não conseguimos verificar os dados incluídos na solicitação contra dados definidos na conta comercial do WhatsApp (por exemplo, o PIN de duas etapas incluído na solicitação está incorreto).',
            errorDetails:
                'Consulte o documento de aplicação de políticas para saber mais sobre violações de políticas e como para resolvê-los. Você também pode usar a API Health Status, que pode fornecer informações adicionais sobre o motivo ou motivos do bloqueio da conta.'
        },

        {
            errorCode: 1,
            errorMessage: 'Solicitação inválida ou possível erro no servidor.',
            errorDetails:
                'Confira a plataforma WhatsApp Business Página de status para ver informações de status da API. Se não houver interrupções no servidor, verifique o referência de endpoint e verifique se sua solicitação está formatada corretamente e atende a todos os requisitos de endpoint.'
        },
        {
            errorCode: 2,
            errorMessage: 'Temporário devido a tempo de inatividade ou devido ficar sobrecarregado.',
            errorDetails:
                'Confira o WhatsApp Business Página de status da plataforma para ver a API informações de status antes de tentar novamente.'
        },
        {
            errorCode: 33,
            errorMessage: 'O número de telefone comercial foi excluído.',
            errorDetails: 'Verifique se o negócio número de telefone está correto.'
        },
        {
            errorCode: 100,
            errorMessage: 'A solicitação incluiu um ou mais não suportados ou parâmetros com erros ortográficos.',
            errorDetails:
                'Veja a referência do endpoint para determinar quais parâmetros são suportados e como eles são escritos. Certifique-se ao definir o negócio chave pública, é um RSA válido de 2048 bits chave pública no formato PEM. Certifique-se lá não há incompatibilidade entre o número de telefone id que você está registrando e um armazenado anteriormente identificação do número de telefone. Certifique-se de que seu parâmetro seja sob qualquer restrição de comprimento para o tipo.'
        },
        {
            errorCode: 131000,
            errorMessage:
                'A mensagem não foi enviada devido a um erro desconhecido. Ao definir uma chave pública comercial, ela também não conseguiu calcular a assinatura, ligue para o Ponto de extremidade GraphQL ou ponto de extremidade GraphQL retornou um erro.',
            errorDetails: 'Tente novamente. Se o erro persistir, abra um ticket de suporte direto.'
        },
        {
            errorCode: 131005,
            errorMessage: 'A permissão não foi concedida ou foi foi removido.',
            errorDetails:
                'Use o depurador de token de acesso para verificar se seu aplicativo foi concedeu as permissões necessárias pelo ponto final. Consulte Solução de problemas.'
        },
        {
            errorCode: 131008,
            errorMessage: 'A solicitação não possui um parâmetro obrigatório.',
            errorDetails: 'Veja a referência do endpoint para determinar quais parâmetros é requerido.'
        },
        {
            errorCode: 131009,
            errorMessage: 'Um ou mais valores de parâmetro são inválidos.',
            errorDetails:
                'Veja a referência do endpoint para determinar quais valores são suportados para cada parâmetro e consulte Telefone Números para aprender como adicionar um número de telefone para uma conta comercial do WhatsApp.'
        },
        {
            errorCode: 131016,
            errorMessage: 'Um serviço está temporariamente indisponível.',
            errorDetails:
                'Confira o WhatsApp Business Página de status da plataforma para ver a API informações de status antes de tentar novamente.'
        },
        {
            errorCode: 131021,
            errorMessage: 'O número de telefone do remetente e do destinatário é o mesmo.',
            errorDetails: 'Enviar uma mensagem para um telefone número diferente do remetente.'
        },
        {
            errorCode: 131026,
            errorMessage:
                'A mensagem não foi entregue para criar um alto experiência do usuário de qualidade. Consulte Marketing por usuário Limites de mensagens do modelo.',
            errorDetails:
                'Usando uma comunicação que não seja do WhatsApp método, peça ao usuário do WhatsApp para: Confirme se eles podem realmente enviar um mensagem para seu número de telefone comercial do WhatsApp. Confirme se eles aceitaram nossos Termos de Uso mais recentes Serviço (Configurações > Ajuda ou Configurações > Aplicativo informações irão levá-los a aceitar os termos/políticas, caso ainda não o tenham feito) Atualize para a versão mais recente do cliente WhatsApp.'
        },
        {
            errorCode: 131042,
            errorMessage: 'Ocorreu um erro relacionado ao seu Forma de pagamento.',
            errorDetails:
                'Consulte Sobre o faturamento do seu WhatsApp Business Conta e verifique se você configurou o faturamento corretamente. Problemas comuns: a conta de pagamento não está vinculada uma conta comercial do WhatsApp A linha de crédito ultrapassou o limite Linha de crédito (conta de pagamento) não definida ou ativa A conta comercial do WhatsApp foi excluída Conta comercial do WhatsApp está suspensa Fuso horário não definido Moeda não definida A solicitação MessagingFor (em nome de) está pendente ou recusada Limite do nível gratuito de conversação excedido sem um valor válido Forma de pagamento'
        },
        {
            errorCode: 131045,
            errorMessage: 'A mensagem não foi enviada devido a um erro de registro do número de telefone.',
            errorDetails: 'Cadastre o número de telefone antes de tentar novamente.'
        },
        {
            errorCode: 131047,
            errorMessage: 'Mais de 24 horas se passaram desde a última resposta do destinatário o número do remetente.',
            errorDetails: 'Envie ao destinatário um comunicado de empresa mensagem usando um modelo de mensagem.'
        },
        {
            errorCode: 131051,
            errorMessage: 'Tipo de mensagem não compatível.',
            errorDetails: 'Consulte Mensagens para suporte tipos de mensagens antes de tentar novamente com um tipo de mensagem compatível.'
        },
        {
            errorCode: 131052,
            errorMessage: 'Não foi possível baixar a mídia enviada pelo usuário.',
            errorDetails:
                'Não foi possível baixar a mídia por uma ou mais razões, como um tipo de mídia não suportado. Consulte o valor error.error_data.details para obter mais informações sobre por que estávamos não é possível baixar a mídia. Peça ao usuário do WhatsApp para lhe enviar a mídia arquivo usando um método que não seja do WhatsApp.'
        },
        {
            errorCode: 131053,
            errorMessage: 'Não foi possível fazer upload da mídia usada na mensagem.',
            errorDetails:
                'Não foi possível fazer upload da mídia para um ou mais motivos, como um não suportado tipo de mídia. Consulte o error.error_data.details valor para obter mais informações sobre por que estávamos não é possível fazer upload da mídia. Recomendamos que você inspecione todos os arquivos de mídia que estão causando erros e confirme que eles são de fato apoiados.'
        },
        {
            errorCode: 131057,
            errorMessage: 'A conta Business está em modo de manutenção',
            errorDetails:
                'A conta comercial do WhatsApp é em modo de manutenção. Uma razão para pode ser que a conta esteja passando por uma atualização de rendimento.'
        },
        {
            errorCode: 132000,
            errorMessage:
                'O número de parâmetro variável valores incluídos na solicitação não corresponder ao número de parâmetros variáveis definido no modelo.',
            errorDetails:
                'Consulte as diretrizes do modelo de mensagem e certifique-se de que a solicitação inclua todos os valores dos parâmetros variáveis que foram definidos no modelo.'
        },
        {
            errorCode: 132001,
            errorMessage: 'O modelo não existe no idioma especificado ou o modelo não foi aprovado.',
            errorDetails:
                'Certifique-se de que seu modelo foi aprovado e o nome do modelo e a localidade do idioma está correta. Por favor, certifique-se você segue as diretrizes do modelo de mensagem.'
        },
        {
            errorCode: 132005,
            errorMessage: 'O texto traduzido é muito longo.',
            errorDetails:
                'Verifique o Gerenciador do WhatsApp para verificar que seu modelo foi traduzido. Consulte Classificação de qualidade e status do modelo.'
        },
        {
            errorCode: 132007,
            errorMessage: 'O conteúdo do modelo viola uma política do WhatsApp.',
            errorDetails: 'Consulte os motivos de rejeição para determinar possíveis razões por violação.'
        },
        {
            errorCode: 132012,
            errorMessage: 'Parâmetro variável valores formatados incorretamente.',
            errorDetails:
                'Os valores dos parâmetros variáveis incluídos na solicitação não são usando o formato especificado no modelo. Consulte Diretrizes para modelos de mensagens.'
        },
        {
            errorCode: 132015,
            errorMessage: 'O modelo está pausado devido de baixa qualidade, por isso não pode ser enviado em uma mensagem modelo.',
            errorDetails: 'Edite o modelo para melhorar sua qualidade e tente novamente uma vez É aprovado.'
        },
        {
            errorCode: 132016,
            errorMessage: 'O modelo foi pausado muitas vezes devido ao baixo qualidade e agora está permanentemente desativado.',
            errorDetails: 'Crie um novo modelo com conteúdo diferente.'
        },
        {
            errorCode: 132068,
            errorMessage: 'O fluxo está em estado bloqueado.',
            errorDetails: 'Corrija o fluxo'
        },
        {
            errorCode: 132069,
            errorMessage: 'O fluxo está em estado acelerado e 10 mensagens usando esse fluxo já foi enviado na última hora.',
            errorDetails: 'Corrija o fluxo'
        },
        {
            errorCode: 133000,
            errorMessage: 'Uma tentativa anterior de cancelamento de registro falhou.',
            errorDetails: 'Cancelar o registro do número novamente antes de se registrar.'
        },
        {
            errorCode: 133004,
            errorMessage: 'O servidor está temporariamente indisponível.',
            errorDetails:
                'Confira o WhatsApp Business Página de status da plataforma para ver a API informações de status e verifique o valor dos detalhes da resposta antes de tentar novamente.'
        },
        {
            errorCode: 133005,
            errorMessage: 'PIN de verificação em duas etapas incorreto.',
            errorDetails:
                'Verifique se a verificação em duas etapas O PIN incluído na solicitação está correto. Para redefinir o PIN de verificação em duas etapas: Desative a verificação em duas etapas. Envie uma solicitação POST que inclua o novo PIN para o endpoint do número de telefone.'
        },
        {
            errorCode: 133006,
            errorMessage: 'Necessidades de número de telefone a ser verificado antes de se registrar.',
            errorDetails: 'Verifique o número de telefone antes de registrá-lo.'
        },
        {
            errorCode: 133008,
            errorMessage: 'Muitas verificações em duas etapas Suposições de PIN para este número de telefone.',
            errorDetails: 'Tente novamente após o tempo especificado no valor de resposta de detalhes.'
        },
        {
            errorCode: 133009,
            errorMessage: 'PIN de verificação em duas etapas foi inserido muito rapidamente.',
            errorDetails: 'Verifique a resposta detalhada valor antes de tentar novamente.'
        },
        {
            errorCode: 133010,
            errorMessage: 'Número de telefone não cadastrado na plataforma WhatsApp Business.',
            errorDetails: 'Cadastre o telefone número antes de tentar novamente.'
        },
        {
            errorCode: 133015,
            errorMessage:
                'O número de telefone que você é a tentativa de registro foi excluído recentemente e exclusão ainda não foi concluído.',
            errorDetails: 'Espere 5 minutos antes de tentar novamente a solicitação.'
        },
        {
            errorCode: 135000,
            errorMessage: 'Falha ao enviar mensagem por causa de um desconhecido erro com seus parâmetros de solicitação.',
            errorDetails:
                'Veja a referência do endpoint para determinar se você está consultando o endpoint usando a sintaxe correta. Entre em contato com o suporte ao cliente se continuar recebendo este código de erro em resposta.'
        }
    ];
}

interface TranslatedStatusErrors {
    errorCode: number;
    errorMessage: string;
    errorDetails: string;
}
