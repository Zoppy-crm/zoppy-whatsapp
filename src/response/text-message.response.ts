export class TextMessageResponse {
    public messaging_product: string;
    public contacts: Array<ContactsResponse>;
    public messages: Array<MessagesResponse>;
}

export class ContactsResponse {
    public input: string;
    public wa_id: string;
}

export class MessagesResponse {
    public id: string;
}
