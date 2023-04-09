var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
process.on('uncaughtException', function (err) {
  console.log(err);
});
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/scrape', async (req, res) => {
  const url = req.query.url || 'https://www.baidu.com';
      const browser = await puppeteer.launch({
          ignoreHTTPSErrors: true
      });
      const page = await browser.newPage();
      page.setViewport({width:1200,height:1960})
      await page.setBypassCSP(true);
      await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
      });
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      const content = await page.content();
      page.screenshot();
      await page.screenshot({ path: 'example.png' });
      await browser.close();
      res.send(content);
  });
  // app.post('/scrape', async (req, res) => {
  //     const url = req.body.url || 'https://www.baidu.com';
  //     const browser = await puppeteer.launch({
  //       ignoreHTTPSErrors: true
  //     });
  //     const page = await browser.newPage();
  //     await page.setBypassCSP(true);
  //     await page.setExtraHTTPHeaders({
  //       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
  //     });
  //     await page.goto(url, { waitUntil: 'networkidle2' }); //load  domcontentloaded  networkidle2
  //     const content = await page.content();
  //     await browser.close();
  //     res.send(content);
  // });
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
