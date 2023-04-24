import { Request, Response } from "express";

import { tables as db } from "../database";
import { filterParams, setSort } from "../utils/searches/IdeaSearchAll";

class IdeaController {
	async getAllCommunityIdeas(req: any, res: Response) {
		let per_page = req.query.per_page || 4;
		let curr_page = req.query.curr_page || 1;
		let filters: any = { ...filterParams(req.query) };
		try {
			const offset = (curr_page < 1 ? curr_page : curr_page - 1) * per_page;
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
				per_page: per_page || 20,
				curr_page: curr_page || 1,
				prev_page: curr_page == 1 ? null : curr_page - 1,
				next_page: curr_page == last_page ? null : curr_page + 1,
				offset,
				to: offset + per_page,
				last_page,
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

	async updateIdeasStatus() {
		console.log("here");

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
			} else if (voteSum >= 4.5) {
				await db.Idea.update({ idea_status: "Approved" }, { where: { idea_id: idea.idea_id } });
			}
		}

		// update "New" to "On Voting"
		await db.Idea.update({ idea_status: "On Voting" }, { where: { idea_status: "New" } });
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

			return res.status(200).json({ message: "Interaction added or updated!" });
		} catch (err) {
			console.log(err)
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	addCommunityIdeaMember(req: Request, res: Response) {
		try {
			return res.status(200).send("ideas");
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	getCommunityIdeaMembers(req: Request, res: Response) {
		try {
			return res.status(200).send("ideas");
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	addCommunityIdeaTask(req: Request, res: Response) {
		try {
			return res.status(200).send("ideas");
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	getCommunityIdeaTasks(req: Request, res: Response) {
		try {
			return res.status(200).send("ideas");
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}
}

export default IdeaController;