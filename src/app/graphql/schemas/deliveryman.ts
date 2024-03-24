import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql/type';
import DeliverymanService from '@Services/DeliverymanService';
import { DeliveriesType } from '@App/graphql/schemas/deliveries';
import { RestaurantType } from '@App/graphql/schemas/restaurant';
import { MenuType } from '@App/graphql/schemas/menu';
import { DisheType } from '@App/graphql/schemas/dishe';
import { UserType } from '@App/graphql/schemas/users';
import { CustomerType } from '@App/graphql/schemas/customer';

export const deliverymanService = new DeliverymanService();

export const DeliverymanDeliveries: any = new GraphQLObjectType({
	name: 'DeliverymanDeliveries',
	description: 'Type representing a delivery',
	fields: () => ({
		user_id: { type: GraphQLID },
		status: { type: GraphQLString },
		address: { type: GraphQLString },
		deliverie: {
			type: DeliveriesType
		},
		customer: {
			type: CustomerType
		},
		restaurant: {
			type: RestaurantType
		},
		menu: {
			type: new GraphQLList(MenuType)
		},
		dishe: {
			type: new GraphQLList(DisheType)
		}
	})
});

export const DeliverymanType = new GraphQLObjectType({
	name: 'DeliverymanType',
	fields: {
		user_id: { type: GraphQLID },
		status: { type: GraphQLString },
		address: { type: GraphQLString },
		user: {
			type: UserType
		},
		deliveries: {
			type: new GraphQLList(DeliverymanDeliveries)
		}
	}
});
