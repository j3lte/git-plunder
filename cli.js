const meow = require('meow');
const { run } = require('./lib/plunder');

const cli = meow(`
  Usage
    $ git-plunder <url>

  Examples
    $ git-plunder http://website.co/
`, {
  alias: {

  }
});

if (cli.input.length !== 1) {
  console.log(cli.help);
  return;
}

run(cli.input[0]);
