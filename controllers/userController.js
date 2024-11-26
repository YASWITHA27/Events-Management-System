const User = require('../models/user');
const Event = require('../models/event');
const RSVP = require('../models/rsvp');
const { categories } = require('../public/javascript/utils');


exports.new = (req, res) => {
    res.render('./user/new');
}

exports.getUserLogin = (req, res) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{

    let email = req.body.email;
    if(email){
        email = email.toLowerCase();
    }
    const password = req.body.password;
    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
                .then(result=>{
                    if(result) {
                        req.session.user = user;
                        req.flash('success', 'You have successfully logged in');
                        res.redirect('/');
                } else {
                    req.flash('error', 'wrong password');      
                    res.redirect('/users/login');
                }
            });   
        }  
    })
    .catch(err => next(err));
};

exports.create = (req, res, next) => {
    let user = new User(req.body);
    if(user.email){
        user.email = user.email.toLowerCase();
    }
    user.save()
    .then(user=> {
        req.flash('success', 'Registration Successfull');
        return res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        } 
        next(err);
    });
}

exports.profile = (req, res, next) => {
    const userId = req.session.user;

    // Fetch user data and events hosted by the user
    Promise.all([
        User.findById(userId),
        Event.find({ host: userId }).sort({ title: 1 }),
        Event.find(),
        RSVP.find({ attendee: userId })
    ])
        .then(results => {
            const [user, eventsData, allEVents, rsvpData] = results;

            // Group events by category
            const eventsMap = {};
            const categoryNames = [];
            eventsData.forEach(event => {
                const category = event.category;
                categoryNames.push(category);
                if (!eventsMap[category]) {
                    eventsMap[category] = [];
                }
                eventsMap[category].push(event);
            });

            const sortedEventsMap = {};
            categoryNames.sort().forEach(categoryName => {
                sortedEventsMap[categoryName] = eventsMap[categoryName];
            });
            const rsvps = rsvpData.map(rsvp => {
                const e = allEVents.find(data => {
                    return data._id.toString() == rsvp.event.toString()})
                return {eventName: e.title, s: rsvp.status, eventId: rsvp.event }
            })
            res.render('./user/profile', { user, events: sortedEventsMap, categoryImages: categories, rsvpEvents: rsvps });
        })
        .catch(err => next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else{
        return res.redirect('/');  
       }
    });
};