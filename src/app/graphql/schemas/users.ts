import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql/type';
import UserService from '@Services/UserService';

export const userService = new UserService();

export const UserType = new GraphQLObjectType({
	name: 'UserType',
	fields: {
		id: {type: GraphQLID},
		name: {type: GraphQLString},
		role: {type: GraphQLString},
		email: {type: GraphQLString},
		phone: {type: GraphQLString},
		created_at: {type: GraphQLString},
		updated_at: {type: GraphQLString}
	}
});
