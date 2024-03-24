import { GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql/type';
import DisheService from '@Services/DisheService';

export const disheService = new DisheService();

export const DisheType = new GraphQLObjectType({
	name: 'Dishe',
	fields: {
		id: { type: GraphQLID },
		card_id: { type: GraphQLID },
		restaurant_id: { type: GraphQLID },
		name: { type: GraphQLString },
		price: { type: GraphQLInt }
	}
});