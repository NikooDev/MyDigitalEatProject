import { GraphQLEnumType, GraphQLString, GraphQLID, GraphQLObjectType, GraphQLList } from 'graphql/type';
import DeliveryService from '@Services/DeliveryService';
import { UserType } from '@App/graphql/schemas/users';
import { CustomerType } from '@App/graphql/schemas/customer';
import { RestaurantType } from '@App/graphql/schemas/restaurant';
import { DeliverymanType } from '@App/graphql/schemas/deliveryman';
import { MenuType } from '@App/graphql/schemas/menu';
import { DisheType } from '@App/graphql/schemas/dishe';

export const deliveryService = new DeliveryService();

const DeliveryEnumType = new GraphQLEnumType({
	name: 'DeliveryStatus',
	description: 'Enumeration representing delivery status',
	values: {
		PENDING: { value: 'PENDING' },
		DELIVERED: { value: 'DELIVERED' },
		CANCELLED: { value: 'CANCELLED' }
	}
});

export const DeliveriesType = new GraphQLObjectType({
	name: 'DeliveryType',
	description: 'Type representing a delivery',
	fields: () => ({
		id: { type: GraphQLID },
		customer_id: { type: GraphQLID },
		deliveryman_id: { type: GraphQLID },
		restaurant_id: { type: GraphQLID },
		status: { type: DeliveryEnumType },
		created_at: { type: GraphQLString },
		user: {
			type: UserType
		},
		customer: {
			type: CustomerType
		},
		restaurant: {
			type: RestaurantType
		},
		deliveryman: {
			type: DeliverymanType
		},
		menu: {
			type: new GraphQLList(MenuType)
		},
		dishe: {
			type: new GraphQLList(DisheType)
		}
	})
});