const mongoose = require('mongoose');

// Você pode usar pra avatar do usuário ou artigo e outros trecos
const AttachmentSchema = new mongoose.Schema({
    id: {
        type: String, // snowflake
        unique: true,
    },
    type: String,
    extension: String,
    createdAt: Date,
    updatedAt: {
        type: Date,
        default: +Date.now()
    }
}, {
    _id: false
});

module.exports = AttachmentSchema;