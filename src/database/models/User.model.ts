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
import Notification from "./Notification.model";
import Idea from "./Idea.model";

class User extends Model<InferAttributes<User, { omit: "ideas" }>, InferCreationAttributes<User, { omit: "ideas" }>> {
	// id can be undefined during creation when using `autoIncrement`
	declare user_id: CreationOptional<number>;

	declare user_name: string;
	declare user_email: string;

	// You can also pre-declare possible inclusions, these will only be populated if you
	// actively include a relation.
	declare notifications?: NonAttribute<Notification[]>; // Note this is optional since it's only populated when explicitly requested in code

	// Since TS cannot determine model association at compile time
	// we have to declare them here purely virtually
	// these will not exist until `Model.init` was called.
	declare getIdeas: HasManyGetAssociationsMixin<Idea>; // Note the null assertions!
	declare addIdea: HasManyAddAssociationMixin<Idea, number>;
	declare addIdeas: HasManyAddAssociationsMixin<Idea, number>;
	declare setIdeas: HasManySetAssociationsMixin<Idea, number>;
	declare removeIdea: HasManyRemoveAssociationMixin<Idea, number>;
	declare removeIdeas: HasManyRemoveAssociationsMixin<Idea, number>;
	declare hasIdea: HasManyHasAssociationMixin<Idea, number>;
	declare hasIdeas: HasManyHasAssociationsMixin<Idea, number>;
	declare countIdeas: HasManyCountAssociationsMixin;

	// You can also pre-declare possible inclusions, these will only be populated if you
	// actively include a relation.
	declare ideas?: NonAttribute<Idea[]>; // Note this is optional since it's only populated when explicitly requested in code

	declare static associations: {
		ideas: Association<User, Idea>;
	};
}

export default User;