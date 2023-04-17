import {
	Association,
	DataTypes,
	HasManyAddAssociationMixin,
	HasManyCountAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasManyGetAssociationsMixin,
	HasManyHasAssociationMixin,
	HasManySetAssociationsMixin,
	HasManyAddAssociationsMixin,
	HasManyHasAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyRemoveAssociationsMixin,
	Model,
	ModelDefined,
	Optional,
	Sequelize,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	NonAttribute,
	ForeignKey,
} from "sequelize";

import dbConfig from "../config/db";
import User from "./models/User.model";
import Notification from "./models/Notification.model";
import Category from "./models/Category.model";
import Technology from "./models/Technology.model";
import Idea from "./models/Idea.model";
import IdeaAttachment from "./models/IdeaAttachment.model";
import IdeaInteraction from "./models/IdeaInteraction.model";
import IdeaTeam from "./models/IdeaTeam.model";
import IdeaTask from "./models/IdeaTask.model";

const sequelize = new Sequelize(
	dbConfig.database || "",
	dbConfig.username || "",
	dbConfig.password,
	{
		host: dbConfig.host,
		dialect: "mysql"
	}
);

// models
User.init(
	{
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		user_name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter a name."
				},
				hasTwoOrMoreWords(value: string) {
					if (value.split(" ").length < 2) {
						throw new Error("Name has to be at least name and surname.");
					}
				}
			}
		},
		user_email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: {
				name: "unique_user_email",
				msg: "Email address already in use."
			},
			validate: {
				notNull: {
					msg: "Please enter an email."
				},
				isEmail: {
					msg: "Please enter a valid email address."
				},
				isDevscopeEmail(value: string) {
					let emailParts = value.split("@");
					if (emailParts[1] !== "devscope.net") {
						throw new Error("Email is not a DevScope email.");
					}
				}
			}
		},
	},
	{
		tableName: "Users",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

Notification.init(
	{
		notification_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		notification_title: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter a notification title."
				},
			}
		},
		notification_description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter a notification description."
				},
			}
		},
	},
	{
		sequelize,
		tableName: "Notifications",
		timestamps: false,
	}
);

Category.init(
	{
		category_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		category_name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: {
				name: "unique_category_name",
				msg: "Category name already added."
			},
			validate: {
				notNull: {
					msg: "Please enter a category name."
				}
			}
		},
	},
	{
		tableName: "Categories",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

Technology.init(
	{
		technology_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		technology_name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: {
				name: "unique_technology_name",
				msg: "Technology name already added."
			},
			validate: {
				notNull: {
					msg: "Please enter a technology name."
				}
			}
		},
	},
	{
		tableName: "Technologies",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

Idea.init(
	{
		idea_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		idea_title: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: {
				name: "unique_idea_title",
				msg: "Idea title already added."
			},
			validate: {
				notNull: {
					msg: "Please enter an idea title."
				}
			}
		},
		idea_summary: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter an idea summary."
				}
			}
		},
		idea_description: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter an idea description."
				}
			}
		},
		idea_complexity: {
			type: DataTypes.ENUM("Easy", "Medium", "Hard"),
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter an idea complexity."
				},
				isIn: {
					args: [["Easy", "Medium", "Hard"]],
					msg: "Please enter a valid idea complexity."
				}
			}
		},
		idea_durationWeeks: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: {
					args: [1],
					msg: "Idea duration must be at least 1 week."
				},
				isInt: {
					msg: "Idea duration must be an integer."
				}
			}
		},
		idea_isAnon: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		idea_status: {
			type: DataTypes.ENUM("New", "On Voting", "Rejected", "Approved", "Waiting", "On Going", "Finished"),
			allowNull: false,
			validate: {
				isIn: {
					args: [["New", "On Voting", "Rejected", "Approved", "Waiting", "On Going", "Finished"]],
					msg: "Please enter a valid idea status."
				}
			}
		},
		idea_details: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "Ideas",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

const IdeaTechnology = sequelize.define("Idea_Technology", {}, {
	freezeTableName: true,
	timestamps: false,
});

const IdeaAuthor = sequelize.define("Idea_Author", {},
	{
		freezeTableName: true,
		timestamps: false,
	}
);

IdeaAttachment.init(
	{
		attachment_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		attachment_file: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter an attachment file."
				}
			}
		},
		attachment_isPublic: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: "Idea_Attachment",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

IdeaInteraction.init(
	{
		interaction_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		interaction_vote: {
			type: DataTypes.INTEGER,
			allowNull: true,
			validate: {
				min: {
					args: [1],
					msg: "Vote must be at least 1."
				},
				max: {
					args: [5],
					msg: "Vote must be at most 5."
				}
			}
		},
		interaction_comment: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "Idea_Interaction",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

IdeaTeam.init(
	{
		role: {
			type: DataTypes.ENUM("Member", "Requested"),
			allowNull: false,
			defaultValue: "Requested",
			validate: {
				notNull: {
					msg: "Please enter a role."
				},
				isIn: {
					args: [["Member", "Requested"]],
					msg: "Please enter a valid role."
				}
			}
		},
	},
	{
		tableName: "Idea_Team",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

IdeaTask.init(
	{
		task_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		task_description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter a task description."
				},
			}
		},
		task_status: {
			type: DataTypes.ENUM("To Do", "Doing", "Done"),
			allowNull: false,
			defaultValue: "To Do",
			validate: {
				notNull: {
					msg: "Please enter a task status."
				},
				isIn: {
					args: [["To Do", "Doing", "Done"]],
					msg: "Please enter a valid task status."
				}
			}
		},
		task_dueDate: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			validate: {
				notNull: {
					msg: "Please enter a task due date."
				}
			}
		},
	},
	{
		tableName: "Idea_Task",
		freezeTableName: true,
		sequelize, // passing the `sequelize` instance is required
		timestamps: false,
	}
);

// associations
User.hasMany(Notification);
Notification.belongsTo(User);

Category.hasMany(Idea);
Idea.belongsTo(Category);

Idea.belongsToMany(Technology, { through: IdeaTechnology });
Technology.belongsToMany(Idea, { through: IdeaTechnology });

Idea.belongsToMany(User, { through: IdeaAuthor });
User.belongsToMany(Idea, { through: IdeaAuthor });

Idea.hasMany(IdeaAttachment);
IdeaAttachment.belongsTo(Idea);

User.hasMany(IdeaAttachment);
IdeaAttachment.belongsTo(User);

Idea.hasMany(IdeaInteraction);
IdeaInteraction.belongsTo(Idea);

User.hasMany(IdeaInteraction);
IdeaInteraction.belongsTo(User);

Idea.hasMany(IdeaTeam);
IdeaTeam.belongsTo(Idea);

User.hasMany(IdeaTeam);
IdeaTeam.belongsTo(User);

Idea.hasMany(IdeaTask);
IdeaTask.belongsTo(Idea);

User.hasMany(IdeaTask);
IdeaTask.belongsTo(User);

export default sequelize;