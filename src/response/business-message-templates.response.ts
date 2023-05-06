export class BusinessMessageTemplatesResponse {
    public id?: string;
    public category: string;
    public name: string;
    public language: string;
    public status?: string;
    public components: Array<MessageTemplatesComponentResponse> = [];
}

export class MessageTemplatesComponentResponse {
    public type: string;
    public text?: string;
    public buttons?: MessageTemplatesComponentResponseButton[];
    public format?: string;
    public example?: MessageTemplatesComponentResponseExample;
}

export class MessageTemplatesComponentResponseExample {
    public header_text?: string[];
    public header_handle?: string[];
    public body_text?: string[][];
}

export class MessageTemplatesComponentResponseButton {
    public type: string;
    public text: string;
    public url: string;
}
