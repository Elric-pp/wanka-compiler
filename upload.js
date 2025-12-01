import COS from 'cos-nodejs-sdk-v5';

// 通过环境变量配置 COS
// 必需：COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION
const {
  COS_SECRET_ID,
  COS_SECRET_KEY,
  COS_BUCKET,
  COS_REGION
} = process.env;

if (!COS_SECRET_ID || !COS_SECRET_KEY || !COS_BUCKET || !COS_REGION) {
  console.warn('[upload.js] COS env not fully configured, please set COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION');
}

const cos = new COS({
  SecretId: COS_SECRET_ID,
  SecretKey: COS_SECRET_KEY
});

/**
 * 上传本地文件到腾讯云 COS
 * @param {Object} options
 * @param {string} options.filePath 本地文件路径
 * @param {string} options.key 上传到 COS 的对象键名，如 `cards/xxx.png`
 * @returns {Promise<{url: string, location: string, raw: any}>}
 */
export async function uploadToCos({ filePath, key }) {
  if (!filePath || !key) {
    throw new Error('uploadToCos: filePath and key are required');
  }
  if (!COS_BUCKET || !COS_REGION) {
    throw new Error('COS_BUCKET or COS_REGION not configured');
  }

  return new Promise((resolve, reject) => {
    cos.uploadFile({
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      Key: key,
      FilePath: filePath
    }, (err, data) => {
      if (err) return reject(err);
      const location = data.Location || '';
      const url = location.startsWith('http')
        ? location
        : `https://${location}`;
      resolve({ url, location, raw: data });
    });
  });
}
