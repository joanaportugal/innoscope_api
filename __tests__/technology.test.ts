import { login } from "../api_calls/users";
import * as TechnologyCalls from "../api_calls/technology";
const TIMEOUT = 7000;

const data = { name: "John Doe", email: "john.doe@devscope.net" };
let TOKEN = "";

describe.skip("Technology - get all technologies", () => {
	it("should list all technologies", async () => {
		const responseLogin = await login(data);
		TOKEN = responseLogin.data.token;
		const response = await TechnologyCalls.getAll(TOKEN);

		expect(response.status).toBe(200);
		expect(response.data.technologies.length).toBeGreaterThanOrEqual(0);
	}, TIMEOUT);
});

describe.skip("Technology - create technology", () => {
	it("should create technology", async () => {
		const response = await TechnologyCalls.createOne(TOKEN, { name: "a" });
		expect(response.status).toBe(201);
		expect(response.data.message).toBe("Technology created.");
	}, TIMEOUT);

	it("should give error - emty name", async () => {
		const response = await TechnologyCalls.createOne(TOKEN, { name: "" });
		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a technology name.");
	}, TIMEOUT);

	it("should give error - existent name", async () => {
		const response = await TechnologyCalls.createOne(TOKEN, { name: "new technology" });
		expect(response.status).toBe(422);
		expect(response.data.errors).toContain("Technology name already added.");
	}, TIMEOUT);
});