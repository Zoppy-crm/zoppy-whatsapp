import axios from 'axios';
import { WhatsappRoutes } from '../util/whatsapp-routes';
import { WhatsappConversationRequest } from '../request/whatsapp-conversation.request';
import { WhatsappConversationResponse } from '../response/whatsapp-conversation.response';

export class WhatsappService {
    public static async getConversations(request: WhatsappConversationRequest): Promise<WhatsappConversationResponse> {
        const url: string = WhatsappRoutes.makeBaseUrl();

        const params: any = {
            fields: `conversation_analytics.start(${request.from}).end(${request.to}).granularity(DAILY).phone_numbers([]).dimensions(["conversation_type", "conversation_direction", "phone"])`,
            access_token: `${request.apiAccessToken}`
        };

        const response: any = axios.get(url, { params: params });
        return response.data;
    }
}
