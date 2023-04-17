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

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	// id can be undefined during creation when using `autoIncrement`
	declare user_id: CreationOptional<number>;

	declare user_name: string;
	declare user_email: string;

	// You can also pre-declare possible inclusions, these will only be populated if you
	// actively include a relation.
	declare notifications?: NonAttribute<Notification[]>; // Note this is optional since it's only populated when explicitly requested in code

}

export default User;