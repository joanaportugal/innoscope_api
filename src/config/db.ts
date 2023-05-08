require("dotenv").config();

const config = {
	host: process.env.DB_HOST ? process.env.DB_HOST : "",
	username: process.env.DB_USER ? process.env.DB_USER : "",
	password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : "",
	database: process.env.DB_NAME ? process.env.DB_NAME : ""
};

export default config;
