export class TemplateMessageRequest {
    public messaging_product: string = 'whatsapp';
    public to: string = null;
    public type: string = 'template';
    public template: TemplateObject = new TemplateObject();

    public fillParameters(parameters: Array<string> = []): void {
        if (parameters.length <= 0) return;
        const component: ComponentObject = new ComponentObject();
        component.parameters = parameters.map((parameterValue: string) => {
            const newParameter: ParametersObject = new ParametersObject();
            newParameter.text = parameterValue;
            return newParameter;
        });
        this.template.components.push(component);
    }
}

export class TemplateObject {
    public name: string;
    public language: LanguageObject = {
        code: 'pt_BR'
    };
    public components: Array<ComponentObject> = [];
}

export class LanguageObject {
    public code: string = 'pt_BR';
}

export class ComponentObject {
    public type: string = 'body';
    public parameters: Array<ParametersObject> = [];
}

export class ParametersObject {
    public type: string = 'text';
    public text: string;
}
