import { login } from "../api_calls/users";
import * as CategoryCalls from "../api_calls/category";
const TIMEOUT = 7000;

const data = { name: "John Doe", email: "john.doe@devscope.net" };
let TOKEN = "";

describe.skip("Category - get all categories", () => {
	it("should list all categories", async () => {
		const responseLogin = await login(data);
		TOKEN = responseLogin.data.token;
		const response = await CategoryCalls.getAll(TOKEN);

		expect(response.status).toBe(200);
		expect(response.data.categories.length).toBeGreaterThanOrEqual(0);
	}, TIMEOUT);
});

describe.skip("Category - create category", () => {
	it("should create category", async () => {
		const response = await CategoryCalls.createOne(TOKEN, { name: "a" });
		expect(response.status).toBe(201);
		expect(response.data.message).toBe("Category created.");
	}, TIMEOUT);

	it("should give error - emty name", async () => {
		const response = await CategoryCalls.createOne(TOKEN, { name: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a category name.");
	}, TIMEOUT);

	it("should give error - existent name", async () => {
		const response = await CategoryCalls.createOne(TOKEN, { name: "new category" });
		expect(response.status).toBe(422);
		expect(response.data.errors).toContain("Category name already added.");
	}, TIMEOUT);
});