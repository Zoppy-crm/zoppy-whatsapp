export class MarkMessageAsReadRequest {
    public messaging_product: string = 'whatsapp';
    public status: string = 'read';
    public message_id: string = null;
}
