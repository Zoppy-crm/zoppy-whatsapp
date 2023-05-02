import { Company, User } from '@ZoppyTech/models';
import { AppConstants, LogUtilService } from '@ZoppyTech/utilities';

export class LogService {
    public static async warning(params: Params): Promise<void> {
        if (process.env.NODE_ENV === AppConstants.NODE_ENV.TEST) return;
        console.log(params.message);
        await LogUtilService.warning(params.message, params.user, params.company, process.env.NODE_ENV as any);
    }
    public static async error(params: Params): Promise<void> {
        if (process.env.NODE_ENV === AppConstants.NODE_ENV.TEST) return;
        console.log(params.message);
        await LogUtilService.error(params.message, params.user, params.company, process.env.NODE_ENV as any);
    }
    public static async info(params: Params): Promise<void> {
        if (process.env.NODE_ENV === AppConstants.NODE_ENV.TEST) return;
        console.log(params.message);
        await LogUtilService.info(params.message, params.user, params.company, process.env.NODE_ENV as any);
    }
}

interface Params {
    message: string | any;
    user?: User;
    company?: Company;
}
