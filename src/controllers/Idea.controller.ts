import { Request, Response } from "express";

import { tables as db } from "../database";
import { filterParams, setSort } from "../utils/searches/IdeaSearchAll";

class IdeaController {
	async getAllCommunityIdeas(req: any, res: Response) {
		try {
			let per_page = req.query.per_page || 20;
			let curr_page = req.query.curr_page || 1;
			let offset = (curr_page - 1) * per_page;

			let filters: any = { ...filterParams(req.query) };

			let allIdeas = await db.Idea.findAll({
				limit: per_page,
				offset: offset,
				where: { ...filters },
				order: [setSort(req.query.sort)],
			});

			let ideas = [];

			// clean unnecessary items
			for (const idea of allIdeas) {
				const category = await db.Category.findByPk(idea.CategoryCategoryId);
				let technologies = await idea.getTechnologies();
				let item = {
					idea_id: idea.idea_id,
					idea_title: idea.idea_title,
					idea_summary: idea.idea_summary,
					idea_description: idea.idea_description,
					idea_complexity: idea.idea_complexity,
					idea_durationWeeks: idea.idea_durationWeeks,
					idea_status: idea.idea_status,
					categoryId: idea.CategoryCategoryId,
					category: category?.category_name,
					technologies: technologies.map(t => ({ technology_id: t.technology_id, technology_name: t.technology_name })),
				}
				ideas.push(item);
			}

			const last_page = Math.ceil(ideas.length / per_page);
			let pagination = {
				total: ideas.length,
				per_page: per_page,
				curr_page: curr_page,
				prev_page: curr_page == 1 ? null : curr_page - 1,
				next_page: curr_page == last_page ? null : curr_page + 1,
				offset,
				last_page
			};

			return res.status(200).json({ ideas, pagination });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async getCommunityIdeaDetails(req: Request, res: Response) {
		try {
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({
					error: "Idea not found.",
				});
			}
			const category = await db.Category.findByPk(idea.CategoryCategoryId);
			let technologies = await idea.getTechnologies();
			let item = {
				idea_id: idea.idea_id,
				idea_title: idea.idea_title,
				idea_summary: idea.idea_summary,
				idea_description: idea.idea_description,
				idea_complexity: idea.idea_complexity,
				idea_durationWeeks: idea.idea_durationWeeks,
				idea_status: idea.idea_status,
				categoryId: idea.CategoryCategoryId,
				category: category?.category_name,
				technologies: technologies.map(t => ({ technology_id: t.technology_id, technology_name: t.technology_name })),
			}
			return res.status(200).json({ idea: item });

		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async updateIdeasStatusCron() {
		// update "On Voting"...
		// ...to "Rejected" if avg vote is less than 4.5
		// ...to "Approved" if avg vote is more than/equal to 4.5
		let onVotingIdeas = await db.Idea.findAll({ where: { idea_status: "On Voting" } });
		for (const idea of onVotingIdeas) {
			let filter = { IdeaIdeaId: idea.idea_id };
			const interactions = await db.IdeaInteraction.findAll({ where: filter });
			let voteSum = 0;
			if (interactions) {
				for (const interaction of interactions) {
					voteSum += interaction.interaction_vote;
				}
			}
			if (voteSum == 0 || (voteSum / interactions.length) < 4.5) {
				await db.Idea.update({ idea_status: "Rejected" }, { where: { idea_id: idea.idea_id } });
			} else if ((voteSum / interactions.length) >= 4.5) {
				await db.Idea.update({ idea_status: "Approved" }, { where: { idea_id: idea.idea_id } });
			}
		}

		// update "New" to "On Voting"
		await db.Idea.update({ idea_status: "On Voting" }, { where: { idea_status: "New" } });
	}

	async updateIdeaStatus(req: Request, res: Response) {
		try {
			// check idea status - only "Waiting" or "On Going"
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({
					error: "Idea not found.",
				});
			}
			if (idea.idea_status !== "Waiting" && idea.idea_status !== "On Going") {
				return res.status(400).json({ error: "Idea status cannot be updated." });
			}
			// update to next status
			if (idea.idea_status === "Waiting") {
				await idea.update({ idea_status: "On Going" });
			}
			else {
				await idea.update({ idea_status: "Finished" });
			}

			return res.status(200).send({ message: "Idea status updated successfully." });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async getIdeaInteractions(req: Request, res: Response) {
		try {
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			let filter = { IdeaIdeaId: +req.params.ideaId };
			const interactions = await db.IdeaInteraction.findAll({ where: filter });

			let voteSum = 0;
			let comments: any = [];
			for (const interaction of interactions) {
				voteSum += interaction.interaction_vote;
				let user = await db.User.findByPk(interaction.UserUserId);
				comments.push({ comment: interaction.interaction_comment, user: user?.user_name });
			}

			return res.status(200).json({ voteAvg: voteSum / interactions.length, comments });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async addIdeaInteraction(req: any, res: Response) {
		try {
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			if (idea.idea_status === "New") {
				return res.status(400).json({ error: "Idea is not open for interaction." });
			}
			// validate if author is interacting
			const authors: any = await db.IdeaAuthor.findAll({ where: { IdeaIdeaId: idea.idea_id } });
			if (authors.find((a: any) => a.UserUserId == req.details.loggedUserId)) {
				return res.status(400).json({
					error: "You can't interact with your idea.",
				});
			}
			// check if interaction already exists
			let filter = { IdeaIdeaId: +req.params.ideaId, UserUserId: req.details.loggedUserId };
			const interaction = await db.IdeaInteraction.findOne({ where: filter });
			if (!interaction) {
				const item = {
					interaction_vote: req.body.vote || null,
					interaction_comment: req.body.comment || null
				}
				await db.IdeaInteraction.create({ ...filter, ...item });
			}
			else {
				await interaction.update({
					interaction_vote: req.body.vote || interaction.interaction_vote,
					interaction_comment: req.body.comment || interaction.interaction_comment,
				}, { where: filter });
			}

			return res.status(200).json({ message: "Interaction added or updated." });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async getCommunityIdeaMembers(req: Request, res: Response) {
		try {
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			const teamMembers = await db.IdeaTeam.findAll({ where: { IdeaIdeaId: idea.idea_id } });
			const users = await db.User.findAll({ where: { user_id: teamMembers.map(tm => tm.UserUserId) } });
			let members = [];
			for (const user of users) {
				let teamMember = teamMembers.find(tm => tm.UserUserId == user.user_id);
				members.push({ ...user.dataValues, role: teamMember?.role });
			}
			return res.status(200).json({ members });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async addLoggedUserToMembers(req: any, res: Response) {
		try {
			// check idea status - only "Approved", "Waiting" or "On Going"
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			if (idea.idea_status !== "Approved" && idea.idea_status !== "Waiting" && idea.idea_status !== "On Going") {
				return res.status(400).json({ error: "Idea is not open for members." });
			}
			// validate if user is already in team
			let validation = await db.IdeaTeam.findOne({ where: { IdeaIdeaId: idea.idea_id, UserUserId: +req.details.loggedUserId } });
			if (validation) {
				return res.status(400).json({ error: "User is already in team." });
			}

			// add user to team
			await db.IdeaTeam.create({
				IdeaIdeaId: idea.idea_id,
				UserUserId: +req.details.loggedUserId,
				role: "Member"
			});
			if (idea.idea_status === "Approved") {
				await idea.update({ idea_status: "Waiting" });
			}

			return res.status(200).json({ message: "User added to team members." });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async removeLoggedUserFromMembers(req: any, res: Response) {
		try {
			// check idea status - only "Waiting" or "On Going"
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			// validate if user is already in team
			let validation = await db.IdeaTeam.findOne({ where: { IdeaIdeaId: idea.idea_id, UserUserId: +req.details.loggedUserId } });
			if (!validation) {
				return res.status(400).json({ error: "User is not in team." });
			}

			// add user to team
			await db.IdeaTeam.destroy({ where: { IdeaIdeaId: idea.idea_id, UserUserId: +req.details.loggedUserId } });

			return res.status(200).json({ message: "User removed from team members." });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async getCommunityIdeaTasks(req: any, res: Response) {
		try {
			// check if task is "Waiting" or "On Going"
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			// validate if logged user has permission to see task
			let validation = await db.IdeaTeam.findOne({
				where: { IdeaIdeaId: idea.idea_id, UserUserId: +req.details.loggedUserId, role: "Member" }
			});
			if (!validation) {
				return res.status(400).json({ error: "You do not have permission to see tasks to this idea." });
			}
			let taskList = await db.IdeaTask.findAll({ where: { IdeaIdeaId: idea.idea_id } });
			let tasks: any = [];
			for (const item of taskList) {
				let user = item.UserUserId ? await db.User.findByPk(item.UserUserId) : null;
				tasks.push({
					task_id: item.task_id,
					task_description: item.task_description,
					task_dueDate: item.task_dueDate,
					task_userId: user?.user_id
				})
			}

			return res.status(200).json({ tasks });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async addCommunityIdeaTask(req: any, res: Response) {
		let todayDate = new Date();
		let pickedDate = new Date(req.body.dueDate);
		let today_withoutTime = new Date(todayDate.getTime());
		let picked_withoutTime = new Date(pickedDate.getTime());

		today_withoutTime.setUTCHours(0, 0, 0, 0);
		picked_withoutTime.setUTCHours(0, 0, 0, 0);

		if (!(today_withoutTime.getTime() < picked_withoutTime.getTime())) {
			return res.status(422).json({ error: "Pick a date after today." });
		}

		try {
			// check if task is "Waiting" or "On Going"
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			if (idea.idea_status !== "Waiting" && idea.idea_status !== "On Going") {
				return res.status(400).json({ error: "Cannot add tasks for this idea." });
			}
			// validate if logged user has permission to add task
			let validation = await db.IdeaTeam.findOne({
				where: { IdeaIdeaId: idea.idea_id, UserUserId: +req.details.loggedUserId, role: "Member" }
			});
			if (!validation) {
				return res.status(400).json({ error: "You do not have permission to add tasks to this idea." });
			}

			let userId: number | undefined = undefined;

			if (req.body.user) {
				let user = await db.User.findByPk(+req.body.user);
				if (user) {
					userId = user.user_id;
				}
			}

			await db.IdeaTask.create({
				task_description: req.body.description,
				task_status: "To Do",
				task_dueDate: req.body.dueDate,
				IdeaIdeaId: idea.idea_id,
				UserUserId: userId || null
			});

			return res.status(201).json({ message: "Task added to idea." });

		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async editCommunityIdeaTask(req: any, res: Response) {
		let todayDate = new Date();
		let pickedDate = new Date(req.body.dueDate);
		let today_withoutTime = new Date(todayDate.getTime());
		let picked_withoutTime = new Date(pickedDate.getTime());

		today_withoutTime.setUTCHours(0, 0, 0, 0);
		picked_withoutTime.setUTCHours(0, 0, 0, 0);

		if (!(today_withoutTime.getTime() < picked_withoutTime.getTime())) {
			return res.status(422).json({ error: "Pick a date after today." });
		}

		try {
			// check if task is "Waiting" or "On Going"
			const idea = await db.Idea.findByPk(+req.params.ideaId);
			if (!idea) {
				return res.status(404).json({ error: "Idea not found." });
			}
			if (idea.idea_status !== "Waiting" && idea.idea_status !== "On Going") {
				return res.status(400).json({ error: "Cannot edit tasks for this idea." });
			}
			// validate if task belongs to idea
			const task = await db.IdeaTask.findOne({ where: { IdeaIdeaId: idea.idea_id, task_id: +req.params.taskId } });
			if (!task) {
				return res.status(404).json({ error: "Task not found or it doesn't belong to that idea." });
			}

			// validate if logged user has permission to edit task
			let validation = await db.IdeaTeam.findOne({
				where: { IdeaIdeaId: idea.idea_id, UserUserId: +req.details.loggedUserId, role: "Member" }
			});
			if (!validation) {
				return res.status(400).json({ error: "You do not have permission to edit tasks to this idea." });
			}

			let userId: number | undefined = undefined;
			if (req.body.user) {
				let user = await db.User.findByPk(+req.body.user);
				if (user) {
					userId = user.user_id;
				}
			}
			await task.update({
				task_description: req.body.description,
				task_status: req.body.status,
				task_dueDate: req.body.dueDate,
				IdeaIdeaId: idea.idea_id,
				UserUserId: userId || null
			})
			return res.status(200).json({ message: "Task updated successfully." });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}
}

export default IdeaController;