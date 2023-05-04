import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:3000/api/technologies" });

export async function getAll(token: string) {
	try {
		const response = await api.get("/", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}


export async function createOne(token: string, data: object) {
	try {
		const response = await api.post("/", data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}