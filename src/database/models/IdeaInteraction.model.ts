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

import User from "./User.model";
import Idea from "./Idea.model";

class IdeaInteraction extends Model<InferAttributes<IdeaInteraction>, InferCreationAttributes<IdeaInteraction>> {
	// id can be undefined during creation when using `autoIncrement`
	declare interaction_id: CreationOptional<number>;

	declare interaction_vote: number;
	declare interaction_comment: string;

	// foreign keys are automatically added by associations methods (like Model.belongsTo)
	// by branding them using the `ForeignKey` type, `Model.init` will know it does not need to
	// display an error if field is missing.
	declare user: ForeignKey<User["user_id"]>;
	declare idea: ForeignKey<Idea["idea_id"]>;
}

export default IdeaInteraction;