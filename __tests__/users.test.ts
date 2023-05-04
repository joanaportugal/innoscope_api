import * as UserCalls from "../api_calls/users";
const TIMEOUT = 7000;

const data = { name: "John Doe", email: "john.doe@devscope.net" };
const idea = {
	title: "Idea", summary: "Brief description", description: "Big description of idea",
	category: 1, complexity: "Easy", duration: 1, technologies: [1]
};

let TOKEN = "";
let IDEA_ID: number;

describe.skip("Users - login", () => {
	it("should create a new account or login", async () => {
		const response = await UserCalls.login(data);

		expect(response.status).toBe(200);
		expect(response.data.token).toBeTruthy();
		TOKEN = response.data.token;
	}, TIMEOUT);

	it("should give error - empty name", async () => {
		const data = { name: "", email: "john.doe@example.com" };
		const response = await UserCalls.login(data);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid name.");
	}, TIMEOUT);

	it("should give error - only first name", async () => {
		const data = { name: "John", email: "john.doe@example.com" };
		const response = await UserCalls.login(data);

		expect(response.status).toBe(422);
		expect(response.data.errors).toContain("Name has to be at least name and surname.");
	}, TIMEOUT);

	it("should give error - empty email", async () => {
		const data = { name: "John Doe", email: "" };
		const response = await UserCalls.login(data);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid email address.");
	}, TIMEOUT);

	it("should give error - invalid email format", async () => {
		const data = { name: "John Doe", email: "john.doe" };
		const response = await UserCalls.login(data);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid email address.");
	}, TIMEOUT);

	it("should give error - invalid email domain", async () => {
		const data = { name: "John Doe", email: "john.doe@example.com" };
		const response = await UserCalls.login(data);

		expect(response.status).toBe(422);
		expect(response.data.errors).toContain("Email is not a DevScope email.");
	}, TIMEOUT);
});

describe.skip("Users - get list of users", () => {
	it("should list all users in app", async () => {
		const response = await UserCalls.getUsers(TOKEN);

		expect(response.status).toBe(200);
		expect(response.data.users.length).toBeGreaterThanOrEqual(1);
		expect(response.data.users.every((u: any) => u.user_id)).toBeTruthy();
		expect(response.data.users.every((u: any) => u.user_name)).toBeTruthy();
		expect(response.data.users.every((u: any) => u.user_email)).toBeTruthy();
	}, TIMEOUT);

	it("should give error - no token provided", async () => {
		const response = await UserCalls.getUsers("");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);

	it("should give error - invalid token provided", async () => {
		const response = await UserCalls.getUsers("somerandomtoken");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);
});

describe.skip("Users - get logged user's details", () => {
	it("should give user details", async () => {
		const response = await UserCalls.getUserData(TOKEN);

		expect(response.status).toBe(200);
		expect(response.data.user.user_id).toBeGreaterThanOrEqual(1);
		expect(response.data.user.user_name).toBe(data.name);
		expect(response.data.user.user_email).toBe(data.email);
		expect(response.data.ideas.length).toBeGreaterThanOrEqual(0);
		expect(response.data.tasks.length).toBeGreaterThanOrEqual(0);
	}, TIMEOUT);

	it("should give error - no token provided", async () => {
		const response = await UserCalls.getUserData("");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);

	it("should give error - invalid token provided", async () => {
		const response = await UserCalls.getUserData("somerandomtoken");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);
});

describe.skip("Users - get logged user's ideas", () => {
	it("should list ideas - no filters", async () => {
		const response = await UserCalls.getAllIdeas(TOKEN);

		expect(response.status).toBe(200);
		expect(response.data.ideas.length).toBeGreaterThanOrEqual(0);
	}, TIMEOUT);

	it("should list ideas - with filters", async () => {
		let params = { category: 1 }
		const response = await UserCalls.getAllIdeas(TOKEN, params);

		expect(response.status).toBe(200);
		expect(response.data.ideas.length).toBeGreaterThanOrEqual(0);
	}, TIMEOUT);

	it("should include pagination item", async () => {
		const response = await UserCalls.getAllIdeas(TOKEN);
		const { pagination } = response.data;

		expect(response.status).toBe(200);
		expect(pagination.total).toBeGreaterThanOrEqual(0);
		expect(pagination.per_page).toBeGreaterThanOrEqual(1);
		expect(pagination.curr_page >= 1 || !pagination.curr_page).toBeTruthy();
		expect(pagination.next_page >= 2 || !pagination.next_page).toBeTruthy();
		expect(pagination.offset / pagination.per_page).toBeGreaterThanOrEqual(1);
		expect(pagination.to).toBe(pagination.offset + pagination.per_page);
		expect(pagination.last_page).toBeGreaterThanOrEqual(0);
	}, TIMEOUT);

	it("should give error - invalid pagination per_page param", async () => {
		let params = { per_page: 0 };
		const response = await UserCalls.getAllIdeas(TOKEN, params);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid per page quantity.");
	}, TIMEOUT);

	it("should give error - invalid pagination curr_page param", async () => {
		let params = { curr_page: 0 };
		const response = await UserCalls.getAllIdeas(TOKEN, params);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid current page number.");
	}, TIMEOUT);

	it("should give error - empty title param", async () => {
		let params = { title: "" };
		const response = await UserCalls.getAllIdeas(TOKEN, params);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid title.");
	}, TIMEOUT);

	it("should give error - invalid category param", async () => {
		let params = { category: 0 };
		const response = await UserCalls.getAllIdeas(TOKEN, params);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid category.");
	}, TIMEOUT);

	it("should give error - invalid status param", async () => {
		let params = { status: "status" };
		const response = await UserCalls.getAllIdeas(TOKEN, params);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid status.");
	}, TIMEOUT);

	it("should give error - invalid sort param", async () => {
		let params = { sort: "sort" };
		const response = await UserCalls.getAllIdeas(TOKEN, params);

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid sort type.");
	}, TIMEOUT);

	it("should give error - no token provided", async () => {
		const response = await UserCalls.getAllIdeas("");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);

	it("should give error - invalid token provided", async () => {
		const response = await UserCalls.getAllIdeas("somerandomtoken");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);
});

describe.skip("Users - add idea", () => {
	it("should create idea", async () => {
		const response = await UserCalls.addIdea(TOKEN, idea);

		expect(response.status).toBe(201);
		expect(response.data.message).toBe("Idea created.");
		expect(response.data.ideaId).toBeGreaterThanOrEqual(1);
		IDEA_ID = response.data.ideaId;
	}, TIMEOUT);

	it("should give error - empty title", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, title: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a title.");
	}, TIMEOUT);

	it("should give error - empty summary", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, summary: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a summary.");
	}, TIMEOUT);

	it("should give error - empty description", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, description: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a description.");
	}, TIMEOUT);

	it("should give error - invalid category", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, category: 0 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid category.");
	}, TIMEOUT);

	it("should give error - empty complexity", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, complexity: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a complexity.");
	}, TIMEOUT);

	it("should give error - invalid complexity", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, complexity: "something" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid complexity.");
	}, TIMEOUT);


	it("should give error - invalid duration", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, duration: 0 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid duration.");
	}, TIMEOUT);


	it("should give error - invalid technologies", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, technologies: 1 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a list of technologies.");
	}, TIMEOUT);

	it("should give error - invalid technologies itens", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, technologies: [0] });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter valid technologies.");
	}, TIMEOUT);

	it("should give error - invalid technologies ids", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, technologies: [10000] });

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Some technologies you're trying to add don't exist.");
	}, TIMEOUT);

	it("should give error - invalid coauthors", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, coauthors: 1 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a list of coauthors.");
	}, TIMEOUT);

	it("should give error - invalid coauthors itens", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, coauthors: [0] });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter valid coauthors.");
	}, TIMEOUT);

	it("should give error - invalid coauthors ids", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, coauthors: [10000] });

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Some authors you're trying to add don't exist.");
	}, TIMEOUT);

	it("should give error - empty details", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, details: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter details.");
	}, TIMEOUT);

	it("should give error - invalid isAnon", async () => {
		const response = await UserCalls.addIdea(TOKEN, { ...idea, isAnon: "yes" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid value.");
	}, TIMEOUT);

	it("should give error - no token provided", async () => {
		const response = await UserCalls.addIdea("", {});

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);

	it("should give error - invalid token provided", async () => {
		const response = await UserCalls.addIdea("somerandomtoken", {});

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);
});

describe.skip("Users - get one idea that belongs to logged user", () => {
	it("should give idea", async () => {
		const response = await UserCalls.getOneUserIdea(TOKEN, IDEA_ID);
		const ideaResponse = response.data.idea;

		expect(response.status).toBe(200);
		expect(ideaResponse.idea_id).toBeGreaterThanOrEqual(1);
		expect(ideaResponse.idea_title).toBe(idea.title);
		expect(ideaResponse.idea_summary).toBe(idea.summary);
		expect(ideaResponse.idea_description).toBe(idea.description);
		expect(ideaResponse.idea_complexity).toBe(idea.complexity);
		expect(ideaResponse.idea_durationWeeks).toBe(idea.duration);
		expect(ideaResponse.categoryId).toBe(idea.category);

		expect(ideaResponse.technologies.map((t: any) => t.technology_id))
			.toEqual(expect.arrayContaining(idea.technologies));
	}, TIMEOUT);

	it("should give error - no idea found", async () => {
		const response = await UserCalls.getOneUserIdea(TOKEN, 1000);

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Idea not found.");
	}, TIMEOUT);

	it("should give error - no token provided", async () => {
		const response = await UserCalls.getOneUserIdea("", 1);

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);

	it("should give error - invalid token provided", async () => {
		const response = await UserCalls.getOneUserIdea("somerandomtoken", 1);

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);
});

describe.skip("Users - edit one idea that belongs to logged user", () => {
	it("should create idea", async () => {
		const title = "idea name"
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, title });
		const response2 = await UserCalls.getOneUserIdea(TOKEN, IDEA_ID);

		expect(response.status).toBe(200);
		expect(response.data.message).toBe("Idea updated.");
		expect(response2.data.idea.idea_title).toBe(title);
	}, TIMEOUT);

	it("should give error - no idea found", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, 1000, idea);

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Idea not found.");
	}, TIMEOUT);

	it("should give error - empty title", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, title: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a title.");
	}, TIMEOUT);

	it("should give error - empty summary", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, summary: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a summary.");
	}, TIMEOUT);

	it("should give error - empty description", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, description: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a description.");
	}, TIMEOUT);

	it("should give error - invalid category", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, category: 0 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid category.");
	}, TIMEOUT);

	it("should give error - empty complexity", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, complexity: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a complexity.");
	}, TIMEOUT);

	it("should give error - invalid complexity", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, complexity: "something" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid complexity.");
	}, TIMEOUT);


	it("should give error - invalid duration", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, duration: 0 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid duration.");
	}, TIMEOUT);


	it("should give error - invalid technologies", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, technologies: 1 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a list of technologies.");
	}, TIMEOUT);

	it("should give error - invalid technologies itens", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, technologies: [0] });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter valid technologies.");
	}, TIMEOUT);

	it("should give error - invalid technologies ids", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, technologies: [10000] });

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Some technologies you're trying to add don't exist.");
	}, TIMEOUT);

	it("should give error - invalid coauthors", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, coauthors: 1 });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a list of coauthors.");
	}, TIMEOUT);

	it("should give error - invalid coauthors itens", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, coauthors: [0] });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter valid coauthors.");
	}, TIMEOUT);

	it("should give error - invalid coauthors ids", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, coauthors: [10000] });

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Some authors you're trying to add don't exist.");
	}, TIMEOUT);

	it("should give error - empty details", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, details: "" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter details.");
	}, TIMEOUT);

	it("should give error - invalid isAnon", async () => {
		const response = await UserCalls.editOneUserIdea(TOKEN, IDEA_ID, { ...idea, isAnon: "yes" });

		expect(response.status).toBe(422);
		expect(response.data.errors.map((e: any) => e.msg))
			.toContain("Please enter a valid value.");
	}, TIMEOUT);

	it("should give error - no token provided", async () => {
		const response = await UserCalls.editOneUserIdea("", IDEA_ID, idea);

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);

	it("should give error - invalid token provided", async () => {
		const response = await UserCalls.editOneUserIdea("somerandomtoken", IDEA_ID, idea);

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);
});

describe.skip("Users - get ranking", () => {
	it("should return a list with user, number of ideas and number of tasks", async () => {
		const response = await UserCalls.getUsersRanking(TOKEN);
		const { list } = response.data;

		expect(response.status).toBe(200);
		expect(list.length).toBeGreaterThanOrEqual(1);
		expect(list.every((i: any) => i.user)).toBeTruthy();
		expect(list.every((i: any) => i.ideas >= 0)).toBeTruthy();
		expect(list.every((i: any) => i.tasks >= 0)).toBeTruthy();
	}, TIMEOUT);

	it("should include logged user", async () => {
		const response = await UserCalls.getUsersRanking(TOKEN);
		const { list } = response.data;

		expect(response.status).toBe(200);
		expect(list.find((i: any) => i.user === data.name)).toBeTruthy();
	}, TIMEOUT);

	it("should give error - no token provided", async () => {
		const response = await UserCalls.getUsersRanking("");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);

	it("should give error - invalid token provided", async () => {
		const response = await UserCalls.getUsersRanking("somerandomtoken");

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized.");
	}, TIMEOUT);
});