import { Company, WppAccount } from '@ZoppyTech/models';
import { WhatsappConversationResponse } from '../response/whatsapp-conversation.response';
import { WhatsappService } from '../service/whatsapp.service';
import { WhatsappConversationRequest } from '../request/whatsapp-conversation.request';
import { DateUtil } from '@ZoppyTech/utilities';

export class WhatsappWindowCountHelper {
    public static async countPeriodOpenedWindows(from: Date, to: Date, company: Company): Promise<number> {
        const wppAccount: WppAccount = await WppAccount.findOne({ where: { companyId: company.id, active: true } });
        if (!wppAccount) return 0;

        const request: WhatsappConversationRequest = {
            wabaId: wppAccount.wabaId,
            apiAccessToken: wppAccount.accessToken,
            from: DateUtil.toTimeStamp(from),
            to: DateUtil.toTimeStamp(to)
        };

        const conversations: WhatsappConversationResponse = await WhatsappService.getConversations(request);
        const count: number = conversations.conversation_analytics?.data[0]?.data_points?.length ?? 0;

        return count;
    }
}
