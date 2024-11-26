const Event = require('../models/event');
exports.isGuest = (req, res, next) => {
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
}

exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to login first');
        return res.redirect('/users/login');
    }
}

exports.isAuthor = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        return next(err);
    }
    Event.findById(id)
    .then(event => {
        if(event) {
            if(event.host == req.session.user._id) {
                return next();
            } else {
                let err = new Error("Unauthorized to access this resource");
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
}