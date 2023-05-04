import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:3000/api/users" });

export async function login(data: object) {
	try {
		const response = await api.post("/login", data);
		return response;
	} catch (error: any) {
		return error.response;
	}
}
export async function getUsers(token: string) {
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

export async function getUserData(token: string) {
	try {
		const response = await api.get("/me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}

export async function getAllIdeas(token: string, params?: object) {
	try {
		const response = await api.get("/me/ideas", {
			params: params || {},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}

export async function addIdea(token: string, data: object) {
	try {
		const response = await api.post("/me/ideas", data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}

export async function getOneUserIdea(token: string, ideaId: number) {
	try {
		const response = await api.get(`/me/ideas/${ideaId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}

export async function editOneUserIdea(token: string, ideaId: number, data: object) {
	try {
		const response = await api.put(`/me/ideas/${ideaId}`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}

export async function getUsersRanking(token: string) {
	try {
		const response = await api.get("/ranking", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response;
	} catch (error: any) {
		return error.response;
	}
}