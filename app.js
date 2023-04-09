const express = require('express')
const multer = require('multer');
const path = require('path')
const app = express()
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
process.on('uncaughtException', function (err) {
  console.log(err);
});
app.use(bodyParser.json());
app.get('/scrape', async (req, res) => {
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
app.post('/scrape', async (req, res) => {
    const url = req.body.url || 'https://www.baidu.com';
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
    });
    await page.goto(url, { waitUntil: 'networkidle2' }); //load  domcontentloaded  networkidle2
    const content = await page.content();
    await browser.close();
    res.send(content);
});
// Serverless 场景只能读写 /tmp 目录，所以这里需要指定上传文件的目录为 /tmp/upload
const upload = multer({ dest: '/tmp/upload' });

// Routes
app.get(`/`, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/user', (req, res) => {
  res.send([
    {
      title: 'serverless framework',
      link: 'https://serverless.com'
    }
  ])
})

app.get('/user/:id', (req, res) => {
  const id = req.params.id
  res.send({
    id: id,
    title: 'serverless framework',
    link: 'https://serverless.com'
  })
})

app.get('/404', (req, res) => {
  res.status(404).send('Not found')
})

app.get('/500', (req, res) => {
  res.status(500).send('Server Error')
})

app.post('/upload', upload.single('file'), (req, res) => {
  res.send({
    success: true,
    data: req.file,
  });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err)
  res.status(500).send('Internal Serverless Error')
})

app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
})
