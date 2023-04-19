export class WhatsappRoutes {
    public static makeBaseUrl(): string {
        return `${process.env.WHATSAPP_BASE_URL}/${process.env.WHATSAPP_API_VERSION}`;
    }

    public static getMessagesUrl(from: string): string {
        return `${this.makeBaseUrl()}/${from}/messages`;
    }

    public static getPhoneNumbersUrl(wabaId: string): string {
        return `${this.makeBaseUrl()}/${wabaId}/phone_numbers`;
    }

    public static getBusinessProfileUrl(from: string): string {
        return `${this.makeBaseUrl()}/${from}/whatsapp_business_profile`;
    }

    public static getWhatsappBusinessAccountUrl(wabaId: string): string {
        return `${this.makeBaseUrl()}/${wabaId}`;
    }

    public static getMessageTemplatesUrl(wabaId: string): string {
        return `${this.makeBaseUrl()}/${wabaId}/message_templates`;
    }

    public static getRetrieveMediaURL(mediaId: string): string {
        return `${this.makeBaseUrl()}/${mediaId}/`;
    }

    public static getUploadMediaUrl(phoneNumberId: string): string {
        return `${this.makeBaseUrl()}/${phoneNumberId}/media`;
    }
}
