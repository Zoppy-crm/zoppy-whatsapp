import { WhatsappFileType } from '../util/whatsapp-utilities';

export class WhatsappBusinessDownloadMediaResponse {
    public fileType: WhatsappFileType;
    public filePath: string;
    public downloaded: boolean;
}
