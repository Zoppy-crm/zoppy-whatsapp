import { WhatsappWindowCountRequest } from '../request/whatsapp-window-count.request';
import { WhatsappWindowCountResponse } from '../response/whatsapp-window-count.response';
import axios from 'axios';
import { WhatsappRoutes } from '../util/whatsapp-routes';

export class WhatsappService {
    public static async get(request: WhatsappWindowCountRequest): Promise<WhatsappWindowCountResponse> {
        const url: string = WhatsappRoutes.makeBaseUrl();

        const params: any = {
            fields: `conversation_analytics.start(${request.from}).end(${request.to}).granularity(DAILY).phone_numbers([]).dimensions(["conversation_type", "conversation_direction", "phone"])`,
            access_token: `${request.apiAccessToken}`
        };

        const response: any = axios.get(url, { params: params });
        return response.data;
    }
}
