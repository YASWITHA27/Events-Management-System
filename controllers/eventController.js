const model = require('../models/event');
const RSVP = require('../models/rsvp');
const { categories, formatDate } = require('../public/javascript/utils');

exports.index = (req, res, next) => {
    model.find().sort({ title: 1 }).then(eventsData => {
        const eventsMap = {};
        const categorieNames = eventsData.map(event => event.category);
        categorieNames.sort();
        eventsData.forEach(event => {
            const category = event.category;
            categorieNames.push(category);
            if (!eventsMap[category]) {
                eventsMap[category] = [];
            }
            eventsMap[category].push(event);
        });
        const sortedEventsMap = {};
        categorieNames.forEach(categoryName => {
            sortedEventsMap[categoryName] = eventsMap[categoryName];
        });
        
        res.render('./event/index', { events: sortedEventsMap, categoryImages: categories });
    }).catch(err => next(err));
};

exports.show = (req, res, next) => {
    const id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err= new Error('Invalid event id') ;
        err.status=400;
        return next(err);
     }
    model.findById(id).populate('host', 'firstName lastName')
    .then(event => {
        if(event) {
            RSVP.countDocuments({ event: id, status: 'YES' }).then((count) => {
                res.render('./event/show', { event, formatDate, count })
            }).catch(err => next(err));;
        }else{
            let err = new Error("Cannot find event with id: " + id);
            err.status = 404;
            next(err);
        }
    }).catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./event/new');
};

exports.create = (req, res, next) => {
    const image = './images/'+req.file.filename;
    const event = new model(req.body);
    event.image = image;
    event.host = req.session.user;
    event.save()
    .then(()=>{
        req.flash('success', 'Event creation succeeded!');
        return res.redirect('/events')
    })
    .catch(err=>{
        if(err.name==='ValidationError'){
            err.status=400;
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.edit = (req, res, next) => {
    const id = req.params.id;
    
    model.findById(id).then(event => {
        res.render('./event/edit', { event });
    }).catch(err => next(err));
}

exports.update = (req, res, next) => {
    const data = req.body;
    const id = req.params.id;
    let image = data.image;
    if(req.file) {
        image = './images/'+ req.file.filename;
    }
    const updatedEvent = { ...data, image };
    model.findByIdAndUpdate(id,updatedEvent,{useFindAndModify: false}).then(() => {
        req.flash('success', 'Event was updated succeessfully!');
        return res.redirect('/events/'+id);
    }).catch(err=> {
        if(err.name==='ValidationError'){
            err.status=400;
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err)
    });
}

exports.delete = (req, res, next) => {
    const id = req.params.id;
    const deleteRsvps = RSVP.deleteMany({ event: id });
    const deleteEvent = model.findByIdAndDelete(id, { useFindAndModify: false });
    Promise.all([deleteRsvps, deleteEvent])
        .then(() => {
            req.flash('success', 'Event and associated RSVPs were deleted successfully!');
            res.redirect('/events');
        })
        .catch(err => next(err));
}

exports.rsvp = (req, res, next) => {
    const id = req.params.id;
    const host = req.session.user;
    model.findById(id).then((event) => {
        if(event) {
            if(event.host == host){
                let err = new Error("Host of the event cannot request for rsvp");
                err.status = 401;
                next(err);
            }else{
                RSVP.findOneAndUpdate(
                    { event: id, attendee: host },
                    { status: req.body.status },
                    { upsert: true, new: true }
                ).then(()=>{
                    req.flash('success', 'RSVP status updated successfully!!');
                    return res.redirect('/users/profile');
                })
                .catch(err=>{
                    if(err.name==='ValidationError'){
                        err.status=400;
                        req.flash('error', err.message);
                        return res.redirect('back');
                    }
                    next(err);
                });
            }
        }else{
            let err = new Error("Cannot find event with id: " + id);
            err.status = 404;
            next(err);
        }
    }).catch(err=>next(err));
}