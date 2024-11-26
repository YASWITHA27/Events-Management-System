//require modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const methodOverride = require('method-override');
const { hideFlashMessage } = require('./public/javascript/utils');

//create app
const app = express();

//configure app
const port = 3000;
const host = 'localhost';
const url = 'mongodb+srv://rmadavar:IL6Xskti6OpwKNry@cluster0.ivxxxas.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(url)
.then(() => {
    app.listen(port, host, () => {
        console.log('Server running at port: ', port);
    });
})
.catch((err) => { console.log(err.message); })

app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: url}),
        cookie: {maxAge: 60*60*1000}
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.set('view engine', 'ejs');

//mount middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use('/', mainRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);

app.use((req, res, next) => {
    let err = new Error("The server cannot locate " + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if(!err.status){
        err.status = 500;
        err.message = 'Internal Server Error';
    }
    res.status(err.status);
    res.render('error', {error: err});
});
