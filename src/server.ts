import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.get('/', (req, res) => {
	res.send('hello world');
});

async function connectToMongo() {
	return mongoose.connect(
		`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
		{
			auth: {
				password: process.env.MONGO_PASSWORD,
				username: process.env.MONGO_USERNAME,
			},
		},
	);
}

Promise.all([connectToMongo()]).then(() => {
	console.log('db connected!');
	app.listen(process.env.APP_PORT, () => {
		console.log(`server is up and running on port ${process.env.APP_PORT}`);
	});
});
