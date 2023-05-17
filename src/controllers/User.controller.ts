import { Request, Response } from "express";
import { ValidationError, Op } from "sequelize";

import { tables as db } from "../database";
import sequelize from "../database";
import { filterParams, setSort } from "../utils/searches/IdeaSearchAll";

class UserController {
	async getAllIdeas(req: any, res: Response) {
		let per_page = req.query.per_page || 20;
		let curr_page = req.query.curr_page || 1;

		let filters: any = { ...filterParams(decodeURI(req.query)) };

		try {
			const offset = (curr_page > 1 ? curr_page - 1 : curr_page) * per_page;

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
				per_page: per_page,
				curr_page: curr_page,
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

			let ideaTrx = await sequelize.transaction(async (trx) => {
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

			return res.status(201).json({ message: "Idea created.", ideaId: ideaTrx.idea_id });
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
			const user = await db.User.findByPk(+req.details.loggedUserId);

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
				console.log("erro");

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

	async getUsers(req: Request, res: Response) {
		try {
			const users = await db.User.findAll();
			return res.status(200).json({ users });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async getUserData(req: any, res: Response) {
		try {
			// profile data
			const user = await db.User.findByPk(+req.details.loggedUserId);

			// ideas
			const ideasFromUser = await db.IdeaAuthor.findAll({ where: { UserUserId: user?.user_id } });
			const ideaList = await db.Idea.findAll({ where: { idea_id: ideasFromUser.map((item: any) => item.IdeaIdeaId) } });
			const ideas: any = [];
			for (const idea of ideaList) {
				const category = await db.Category.findByPk(idea.CategoryCategoryId);
				ideas.push({ ...idea.dataValues, category_name: category?.category_name });
			}
			// tasks
			const taskList = await db.IdeaTask.findAll({ where: { UserUserId: user?.user_id } });
			const tasks: any = [];
			for (const task of taskList) {
				const idea = await db.Idea.findByPk(task.IdeaIdeaId);
				tasks.push({ ...task.dataValues, idea_name: idea?.idea_title });
			}

			return res.status(200).json({ user, ideas, tasks });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async getUsersRanking(req: Request, res: Response) {
		try {
			const users = await db.User.findAll();
			let list: any = [];

			for (const user of users) {
				const numberIdeas = await db.IdeaAuthor.count({ where: { UserUserId: user.user_id } });
				const numberTasksDone = await db.IdeaTask.count({ where: { UserUserId: user.user_id, task_status: "Done" } });
				list.push({ user: user.user_name, ideas: numberIdeas, tasks: numberTasksDone })
			}

			return res.status(200).json({ list });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}
}

export default UserController;