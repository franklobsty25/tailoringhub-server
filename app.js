var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var config = require('./config');
var cors = require('cors');
var helmet = require('helmet');

const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var customRouter = require('./routes/customs');
var measurementRouter = require('./routes/measurements');
var productRouter = require('./routes/products');
var tailorRouter = require('./routes/tailors');
var cartRouter = require('./routes/carts');
var orderRouter = require('./routes/orders');
var uploadRouter = require('./routes/uploads');
var messageRouter = require('./routes/messages');

const connect = mongoose.connect(config.mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});
connect.then((db) => {
  console.log('Server running...');
})
.catch((error) => {
  console.log(error);
})

var app = express();

// Secure traffice only on https:// protocol
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({store: new FileStore(), secret: 'tailoringhub', resave: false, saveUninitialized: false, cookie: {maxAge: 60000}}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(helmet());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/customs', customRouter);
app.use('/measurements', measurementRouter);
app.use('/products', productRouter);
app.use('/tailors', tailorRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);
app.use('/uploads', uploadRouter);
app.use('/messages', messageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
