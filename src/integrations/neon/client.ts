import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://cafe_hoppr_admin:npg_HV6cMK1zeRio@ep-withered-dream-a160tijj-pooler.ap-southeast-1.aws.neon.tech/cafe_hoppr?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

export { sql };
