export class TextMessageRequest {
    public messaging_product: string = 'whatsapp';
    public recipient_type: string = 'individual';
    public to: string = null;
    public type: string = 'text';
    public text: TextObject = new TextObject();
}

export class TextObject {
    public preview_url: boolean = false;
    public body: string = '';
}
