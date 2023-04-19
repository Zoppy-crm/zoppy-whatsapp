export class DocumentMessageRequest {
    public messaging_product: string = 'whatsapp';
    public to: string = null;
    public type: string = 'document';
    public recipient_type: string = 'individual';
    public document: DocumentObject = new DocumentObject();
}

export class DocumentObject {
    public id: string;
    public caption: string;
    public filename: string;
}
