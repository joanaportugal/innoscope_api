import { Op } from "sequelize";

export function filterParams(query: any): object {
	let filters: any = {};

	if (query.title) filters.idea_title = { [Op.like]: `%${query.title}%` }
	if (query.category) filters.CategoryCategoryId = query.category;
	if (query.status) filters.idea_status = query.status;
	if (query.complexity) filters.idea_complexity = query.complexity;

	return filters;
}

export function setSort(sortBy: string): any {
	switch (sortBy) {
		case "Name (A-Z)": return ["idea_title", "ASC"];
		case "Name (Z-A)": return ["idea_title", "DESC"];
		case "Creation (New-Old)": return ["idea_id", "ASC"];
		case "Creation (Old-New)": return ["idea_id", "DESC"];
		default: return ["idea_id", "ASC"];
	}
}