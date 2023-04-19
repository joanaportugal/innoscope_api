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

import Category from "./Category.model";
import Technology from "./Technology.model";
import User from "./User.model";

class Idea extends Model<InferAttributes<Idea>, InferCreationAttributes<Idea>> {
	[x: string]: any;
	// id can be undefined during creation when using `autoIncrement`
	declare idea_id: CreationOptional<number>;

	declare idea_title: string;
	declare idea_summary: string;
	declare idea_description: string;
	declare idea_complexity: string;
	declare idea_durationWeeks: number;
	declare idea_isAnon: boolean;
	declare idea_status?: string;
	declare idea_details: string;

	// foreign keys are automatically added by associations methods (like Model.belongsTo)
	// by branding them using the `ForeignKey` type, `Model.init` will know it does not need to
	// display an error if field is missing.
	declare category: ForeignKey<Category["category_id"]>;

	// Since TS cannot determine model association at compile time
	// we have to declare them here purely virtually
	// these will not exist until `Model.init` was called.
	declare getTechnologies: HasManyGetAssociationsMixin<Technology>; // Note the null assertions!
	declare addTechnology: HasManyAddAssociationMixin<Technology, number>;
	declare addTechnologies: HasManyAddAssociationsMixin<Technology, number>;
	declare setTechnologies: HasManySetAssociationsMixin<Technology, number>;
	declare removeTechnology: HasManyRemoveAssociationMixin<Technology, number>;
	declare removeTechnologies: HasManyRemoveAssociationsMixin<Technology, number>;
	declare hasTechnology: HasManyHasAssociationMixin<Technology, number>;
	declare hasTechnologies: HasManyHasAssociationsMixin<Technology, number>;
	declare countTechnologies: HasManyCountAssociationsMixin;

	// You can also pre-declare possible inclusions, these will only be populated if you
	// actively include a relation.
	declare technologies?: NonAttribute<Technology[]>; // Note this is optional since it's only populated when explicitly requested in code

	declare static associations: {
		technologies: Association<Technology, Idea>;
	};
}

export default Idea;