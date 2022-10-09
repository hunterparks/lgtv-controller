require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 8090;
app.listen(port, () => {
  console.log(`Running LG TV Controller on port: ${port}`);
});
