require("dotenv").config();

const config = {
	host:
		process.env.NODE_ENV == "development"
			? process.env.DB_HOST
			: "",
	username:
		process.env.NODE_ENV == "development"
			? process.env.DB_USER
			: "",
	password:
		process.env.NODE_ENV == "development"
			? process.env.DB_PASSWORD
			: "",
	database:
		process.env.NODE_ENV == "development"
			? process.env.DB_NAME
			: "",
};

export default config;
