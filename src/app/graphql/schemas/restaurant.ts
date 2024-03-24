import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql/type';
import { MenuType } from '@App/graphql/schemas/menu';
import { DisheType } from '@App/graphql/schemas/dishe';
import RestaurantService from '@Services/RestaurantService';

export const restaurantService = new RestaurantService();

export const RestaurantType = new GraphQLObjectType({
	name: 'Restaurant',
	fields: {
		user_id: { type: GraphQLID },
		card_id: { type: GraphQLID },
		description: { type: GraphQLString },
		address: { type: GraphQLString },
		menu: {
			type: new GraphQLList(MenuType)
		},
		dishe: {
			type: new GraphQLList(DisheType)
		}
	}
});