const OBJECT_ID_REGEX = new RegExp("^[0-9a-fA-F]{24}$");

/**
 * @returns Boolean
 */
exports.isObjectId = function(v) {
    return OBJECT_ID_REGEX.test(v);
}