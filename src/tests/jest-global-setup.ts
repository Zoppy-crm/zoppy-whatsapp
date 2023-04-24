import * as dotenv from 'dotenv';
import * as path from 'path';
import { JestGlobalSetup, TestUtils } from '@ZoppyTech/test-utils';

dotenv.config({ path: path.resolve(__dirname + './../../.env') });

require('ts-node').register({
    transpileOnly: true
});

const setup: any = async (): Promise<void> => {
    await JestGlobalSetup.setup();
};
export default setup;
