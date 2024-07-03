import AWS from 'aws-sdk';
import * as dotenv from "dotenv";
import config from '../config/global.config';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.accessKeySecret,
  region: config.aws.region
});

export default s3;
