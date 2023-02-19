import express from 'express';

const app = express();
app.use(express.static('public'));

const port = process.env.PORT || 3000;
console.log(`app listening on ${port}`);
app.listen(port);