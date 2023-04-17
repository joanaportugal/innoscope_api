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

class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
	// id can be undefined during creation when using `autoIncrement`
	declare notification_id: CreationOptional<number>;

	declare notification_title: string;
	declare notification_description: string;
	// foreign keys are automatically added by associations methods (like Model.belongsTo)
	// by branding them using the `ForeignKey` type, `Model.init` will know it does not need to
	// display an error if field is missing.
	declare user: ForeignKey<User["user_id"]>;
}

export default Notification;