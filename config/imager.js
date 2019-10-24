/**
 * Expose
 */

module.exports = {
  variants: {
    article: {
      resize: {
        detail: 'x440'
      },
      crop: {},
      resizeAndCrop: {
        mini: {
          resize: '63504@',
          crop: '252x210'
        }
      }
    },

    gallery: {
      crop: {
        thumb: '100x100'
      }
    }
  },

  storage: {
    local: {
      provider: 'local',
      path: '../public/images',
      mode: 0777
    },
  },

  debug: true
};