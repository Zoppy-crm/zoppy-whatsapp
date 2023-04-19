export class ImageMessageRequest {
    public messaging_product: string = 'whatsapp';
    public to: string = null;
    public type: string = 'image';
    public recipient_type: string = 'individual';
    public image: ImageObject = new ImageObject();
}

export class ImageObject {
    public id: string;
}
