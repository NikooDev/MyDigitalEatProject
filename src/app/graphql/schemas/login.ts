import { GraphQLObjectType, GraphQLString } from 'graphql/type';
import { UserType } from '@App/graphql/schemas/users';

const LoginResponseType = new GraphQLObjectType({
	name: 'LoginResponse',
	fields: {
		user: {
			type: UserType
		},
		token: { type: GraphQLString },
		message: { type: GraphQLString }
	}
});

export {
	LoginResponseType
};