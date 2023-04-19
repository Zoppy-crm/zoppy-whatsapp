export class WhatsappBusinessMediaRequest {
    public phoneNumberId: string;
    public file: any;
    public type: string;
    public messaging_product: string = 'whatsapp';
    public accessToken: string;
}
