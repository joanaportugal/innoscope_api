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

class Idea extends Model<InferAttributes<Idea>, InferCreationAttributes<Idea>> {
	// id can be undefined during creation when using `autoIncrement`
	declare idea_id: CreationOptional<number>;

	declare idea_title: string;
	declare idea_summary: string;
	declare idea_description: string;
	declare idea_complexity: string;
	declare idea_durationWeeks: number;
	declare idea_isAnon: boolean;
	declare idea_status: string;
	declare idea_details: string;

	// foreign keys are automatically added by associations methods (like Model.belongsTo)
	// by branding them using the `ForeignKey` type, `Model.init` will know it does not need to
	// display an error if field is missing.
	declare category: ForeignKey<Category["category_id"]>;
}

export default Idea;