exports.roles = {
    isAdmin: function (req, res, next) {
        if (req.user._id && req.user.isAdmin) {
            document.getElementById("button#btn").classList.add('btn-danger');
        } else {
            document.getElementById("button#btn").classList.add('btn-info');
        }
    }
}