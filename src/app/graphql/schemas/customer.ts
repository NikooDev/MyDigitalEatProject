import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql/type';
import { DeliveriesType } from '@App/graphql/schemas/deliveries';
import { UserType } from '@App/graphql/schemas/users';
import { MenuType } from '@App/graphql/schemas/menu';
import { DisheType } from '@App/graphql/schemas/dishe';
import { RestaurantType } from '@App/graphql/schemas/restaurant';
import { DeliverymanType } from '@App/graphql/schemas/deliveryman';
import CustomerService from '@Services/CustomerService';

export const customerService = new CustomerService();

export const CustomerDeliveries: any = new GraphQLObjectType({
	name: 'CustomerDeliveries',
	description: 'Type representing a delivery',
	fields: {
		user_id: {type: GraphQLID},
		address: {type: GraphQLString},
		deliverie: {type: DeliveriesType},
		restaurant: {type: RestaurantType},
		deliveryman: {type: DeliverymanType},
		menu: {type: new GraphQLList(MenuType)},
		dishe: {type: new GraphQLList(DisheType)}
	}
});

export const CustomerType = new GraphQLObjectType({
	name: 'Customer',
	fields: {
		user_id: {type: GraphQLID},
		address: {type: GraphQLString},
		user: {
			type: UserType
		},
		deliveries: {
			type: new GraphQLList(CustomerDeliveries)
		}
	}
});