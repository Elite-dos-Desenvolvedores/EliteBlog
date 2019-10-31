exports.variants = {
  article: {
    thumb: {
      options: {
        pool: 5,
        scale: {
          width: 200,
          height: 150,
          type: 'contain'
        },
        crop: {
          width: 200,
          height: 150,
          x: 0,
          y: 0
        },
        format: 'png',
        rotate: 'auto',
      },
      rename: function (file, preset) {
        return;

      }
    },
    large: {
      origianl: true
    }
  }
};

exports.storages = {
  local: {
    provider: 'local',
    path: '/tmp',
    mode: 0777
  },
  amazon: {
    provider: 'amazon',
    key: process.env.IMAGER_S3_KEY,
    keyId: process.env.IMAGER_S3_KEYID,
    container: process.env.IMAGER_S3_BUCKET
  }
}