const mongoose = require('mongoose');
const { DB_URL } = require('./env');

module.exports = () => {
	mongoose.set('strictQuery', false);
	return mongoose.connect(DB_URL);
};