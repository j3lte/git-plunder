const Spider = require('node-spider');
const git = require('simple-git');
const fs = require('fs-extra');

const url = require('url');
const path = require('path');

const cwd = process.cwd();
let errors = false;

let urlToCrawl;

const done = () => {
  git(cwd).raw(
   [
      'checkout',
      '--',
      '.'
   ], (err, result) => {
     if (err) {
       console.log('Git error: ', err);
     } else {
       console.log('Git result', result);
     }
   });
}

const spider = new Spider({
    concurrent: 5,
    delay: 0,
    //logs: process.stderr,
    allowDuplicates: false,
    catchErrors: true,
    addReferrer: false,
    xhr: false,
    keepAlive: false,
    error: function(err, url) {
      console.log('Error: ', url);
      console.log(err);
      errors = true;
    },
    done: function() {
      if (!errors) {
        console.log('All DONE! Checkout');
        done();
        return;
      }
      console.log('Done, but there are errors. Not checking out');
    },
    headers: { 'user-agent': 'node-spider' },
    encoding: null
});

const handleRequest = (doc) => {
    const isHTML = doc.$('body').length === 1;
    const urlPath = url.parse(doc.url).path;
    const currentFilePath = path.join(cwd, urlPath);
    if (isHTML) {
      doc.$('a').each((i, elem) => {
          const href = doc.$(elem).attr('href').split('#')[0];
          const newUrl = doc.resolve(href);
          if (newUrl.indexOf(urlToCrawl) !== -1) {
            spider.queue(newUrl, handleRequest);
          }
      });
    } else {
      console.log(`Saving: ${doc.url}`);
      fs.ensureFileSync(currentFilePath);
      fs.writeFileSync(currentFilePath, doc.res.body, { encoding: null });
    }
};

const run = (urlToGet) => {
  urlToCrawl = url.resolve(urlToGet, '.git/');
  spider.queue(urlToCrawl, handleRequest);
}

module.exports = {
  run
}
