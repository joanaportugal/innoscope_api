import { Request, Response } from "express";
import { ValidationError, Op } from "sequelize";

import { tables as db } from "../database";
import sequelize from "../database";
import { filterParams, setSort } from "../utils/searches/IdeaSearchAll";

class UserController {
	async getAllIdeas(req: any, res: Response) {
		let per_page = req.query.per_page || 4;
		let curr_page = req.query.curr_page || 1;

		let filters: any = { ...filterParams(req.query) };

		try {
			const offset = (curr_page < 1 ? curr_page : curr_page - 1) * per_page;

			const user = await db.User.findByPk(req.details.loggedUserId);

			let ideas: any = [];

			if (user) {
				let allIdeas = await user.getIdeas({
					limit: per_page,
					offset: offset,
					where: { ...filters },
					order: [setSort(req.query.sort)],
				});
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

	async addIdea(req: any, res: Response) {
		const {
			title,
			summary,
			description,
			category,
			complexity,
			duration,
			technologies,
			coauthors,
			isAnon,
			details,
		} = req.body;

		try {
			// validate coauthors existence
			if (coauthors) {
				const idea_coauthors = await db.User.findAll({ where: { user_id: { [Op.in]: coauthors } } });
				if (idea_coauthors.length != coauthors.length) {
					return res.status(404).json({
						error: "Some authors you're trying to add don't exist.",
					});
				}
			}
			// validate technologies existence
			const idea_technologies = await db.Technology.findAll({ where: { technology_id: { [Op.in]: technologies } } });
			if (idea_technologies.length != technologies.length) {
				return res.status(404).json({
					error: "Some technologies you're trying to add don't exist.",
				});
			}

			const ideaItem = {
				idea_title: title,
				idea_summary: summary,
				idea_description: description,
				CategoryCategoryId: category,
				idea_complexity: complexity,
				idea_durationWeeks: duration,
				idea_isAnon: Boolean(isAnon),
				idea_details: details,
			};

			await sequelize.transaction(async (trx) => {
				const idea = await db.Idea.create(ideaItem, { transaction: trx });

				let list = coauthors ? [req.details.loggedUserId, ...coauthors] : [req.details.loggedUserId];

				for (const item of list) {
					await db.IdeaAuthor.create(
						{ IdeaIdeaId: idea.idea_id, UserUserId: item },
						{ transaction: trx }
					);
				}

				for (const technology of technologies) {
					await db.IdeaTechnology.create(
						{ IdeaIdeaId: idea.idea_id, TechnologyTechnologyId: technology },
						{ transaction: trx }
					);
				}

				return idea;

			});

			return res.status(201).json({ message: "Idea created." });
		} catch (err) {
			if (err instanceof ValidationError) {
				return res.status(400).json({
					msg: err.errors.map((e) => e.message),
				});
			}
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async getOneUserIdea(req: any, res: Response) {
		try {
			const user = await db.User.findByPk(req.details.loggedUserId);

			if (user) {
				const ideaExistsInUser = await user.hasIdea(+req.params.ideaId);
				if (!ideaExistsInUser) {
					return res.status(404).json({ error: "Idea not found." });
				}
				const idea = await db.Idea.findByPk(+req.params.ideaId);
				if (idea) {
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
				}

				return res.status(200).json({ idea });
			}
			else {
				return res.status(500).json({
					error: "An error occurred. Try again!",
				});
			}
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async editOneUserIdea(req: any, res: Response) {
		const {
			title,
			summary,
			description,
			category,
			complexity,
			duration,
			technologies,
			coauthors,
			isAnon,
			details,
		} = req.body;

		try {
			const user = await db.User.findByPk(req.details.loggedUserId);

			if (user) {
				const ideaExistsInUser = await user.hasIdea(+req.params.ideaId);
				if (!ideaExistsInUser) {
					return res.status(404).json({ error: "Idea not found." });
				}
				const ideaItem = {
					idea_title: title,
					idea_summary: summary,
					idea_description: description,
					CategoryCategoryId: category,
					idea_complexity: complexity,
					idea_durationWeeks: duration,
					idea_isAnon: Boolean(isAnon),
					idea_details: details,
				};

				await sequelize.transaction(async (trx) => {
					const idea = await db.Idea.update(ideaItem, {
						where: { idea_id: +req.params.ideaId },
						transaction: trx
					})

					let list = coauthors ? [req.details.loggedUserId, ...coauthors] : [req.details.loggedUserId];

					await db.IdeaAuthor.destroy({ where: { IdeaIdeaId: +req.params.ideaId }, transaction: trx });
					await db.IdeaTechnology.destroy({ where: { IdeaIdeaId: +req.params.ideaId }, transaction: trx });

					for (const item of list) {
						await db.IdeaAuthor.create(
							{ IdeaIdeaId: +req.params.ideaId, UserUserId: item },
							{ transaction: trx }
						);
					}

					for (const technology of technologies) {
						await db.IdeaTechnology.create(
							{ IdeaIdeaId: +req.params.ideaId, TechnologyTechnologyId: technology },
							{ transaction: trx }
						);
					}

					return idea;

				});

				return res.status(200).json({ message: "Idea updated." });
			}
			else {
				return res.status(500).json({
					error: "An error occurred. Try again!",
				});
			}
		} catch (err) {
			if (err instanceof ValidationError) {
				return res.status(400).json({
					msg: err.errors.map((e) => e.message),
				});
			}
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}
}

export default UserController;