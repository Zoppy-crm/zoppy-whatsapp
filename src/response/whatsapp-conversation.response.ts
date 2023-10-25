export interface WhatsappConversationResponse {
    conversation_analytics: {
        data: [
            {
                data_points: [
                    {
                        start: number;
                        end: number;
                        conversation: number;
                        phone_number: string;
                        conversation_type: string;
                        conversation_direction: string;
                        cost: number;
                    }
                ];
            }
        ];
    };
    id: string;
}
