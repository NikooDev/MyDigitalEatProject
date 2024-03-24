import { GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql/type';
import MenuService from '@Services/MenuService';

export const menuService = new MenuService();

export const MenuType = new GraphQLObjectType({
	name: 'Menu',
	fields: {
		id: { type: GraphQLID },
		card_id: { type: GraphQLID },
		restaurant_id: { type: GraphQLID },
		name: { type: GraphQLString },
		price: { type: GraphQLInt },
		description: { type: GraphQLString },
	}
});