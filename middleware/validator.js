const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validateSignUp = [body('firstName','first name cannot be empty').notEmpty().trim().escape(),
body('lastName','last name cannot be empty').notEmpty().trim().escape(),
body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','password must be at least 8 characters and atmost 64 characters').isLength({min:8, max:64})];

exports.validateLogIn = [body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','password must be at least 8 characters and atmost 64 characters').isLength({min:8, max:64})];

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Event id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateEvent = [
    body('title', "Title cannot be empty").notEmpty().trim().escape(),
    body('description', "Description cannot be empty").notEmpty().trim().escape(),
    body('loc', "Location cannot be empty").notEmpty().trim().escape(),
    body('startTime', "Start Time cannot be empty").notEmpty().isISO8601().withMessage("Start date must be in ISO 8601 format (YYYY-MM-DDThh:mm:ssTZD)"),
    body('endTime', "End Time cannot be empty").notEmpty().isISO8601().withMessage("End date must be in ISO 8601 format (YYYY-MM-DDThh:mm:ssTZD)"),
    body('category', "Category cannot be empty and should belong to one of the below values in dropdown").notEmpty().isIn(['Sports Extravaganza', 'Board Game Bonanza', 'Cultural Carnival', 'Tech Symposium', 'Other']),
    body('image', "Image cannot be empty").notEmpty(),
    // Custom validation for start date before end date
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error=>{
                req.flash('error',error.msg);
            });
            return res.redirect('back');
        }

        const startTime = new Date(req.body.startTime);
        const endTime = new Date(req.body.endTime);

        if (endTime <= startTime) {
            req.flash('error','End date must be after start date');
            return res.redirect('back');
        }

        next();
    }
];

exports.validatersvp = [
    body('status', "RSVP cannot be empty and should belong to {YES, NO, MAYBE}").trim().escape().isIn(['YES', 'NO', 'MAYBE']),
]

exports.validateResult = (req, res, next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        errors.array().forEach(error=>{
            req.flash('error',error.msg);
        });
        return res.redirect('back');
    }
    else{
        return next();
    }
}
