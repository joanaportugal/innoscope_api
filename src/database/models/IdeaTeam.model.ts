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

class IdeaTeam extends Model<InferAttributes<IdeaTeam>, InferCreationAttributes<IdeaTeam>> {
	// id can be undefined during creation when using `autoIncrement`
	declare ideateam_id: CreationOptional<number>;
	declare role: string;

	// foreign keys are automatically added by associations methods (like Model.belongsTo)
	// by branding them using the `ForeignKey` type, `Model.init` will know it does not need to
	// display an error if field is missing.
	declare UserUserId: ForeignKey<User["user_id"]>;
	declare IdeaIdeaId: ForeignKey<Idea["idea_id"]>;
}

export default IdeaTeam;