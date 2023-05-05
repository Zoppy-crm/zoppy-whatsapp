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
    public parameters?: MessageTemplatesComponentParameterResponse[];
}

export class MessageTemplatesComponentResponseExample {
    public header_text?: string[];
    public body_text?: string[][];
}

export class MessageTemplatesComponentResponseButton {
    public type: string;
    public text: string;
    public url: string;
}

export interface MessageTemplatesComponentParameterResponse {
    type?: string;
    image?: {
        link?: string;
    };
    video?: {
        link?: string;
    };
}
