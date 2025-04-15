import express from 'express';

const app = express();

app.get('/', (req, res) => {
	res.send('hello world');
});

app.listen(process.env.APP_PORT, () => {
	console.log(`server is up and running on port ${process.env.APP_PORT}`);
});
