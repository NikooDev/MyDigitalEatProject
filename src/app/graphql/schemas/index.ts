import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/type';
import { LoginResponseType } from '@App/graphql/schemas/login';
import { customerService, CustomerType } from '@App/graphql/schemas/customer';
import { userService } from '@App/graphql/schemas/users';
import { restaurantService, RestaurantType } from '@App/graphql/schemas/restaurant';
import { DeliveriesType, deliveryService } from '@App/graphql/schemas/deliveries';
import { disheService, DisheType } from '@App/graphql/schemas/dishe';
import { menuService, MenuType } from '@App/graphql/schemas/menu';
import { DeliverymanDeliveries, deliverymanService, DeliverymanType } from '@App/graphql/schemas/deliveryman';
import { RoleEnum } from '@Src/interfaces/User';

const RootQuery = new GraphQLObjectType({
	name: 'Query',
	fields: {
		getCustomer: {
			type: CustomerType,
			resolve: async (parent, args, context) => {
				if (context.dataloaders.user && (context.dataloaders.user.role !== RoleEnum.CUSTOMER)) {
					return null;
				}

				const res = await customerService.read(context.dataloaders.user);

				if (!res.data) {
					return null
				}

				return res.data;
			}
		},
		getRestaurants: {
			type: new GraphQLList(RestaurantType),
			resolve: async () => {
				const res = await restaurantService.read();
				return res.data;
			}
		},
		getDeliveryman: {
			type: DeliverymanType,
			resolve: async (parent, args, context) => {
				if (context.dataloaders.user && (context.dataloaders.user.role !== RoleEnum.DELIVERYMAN)) {
					return null;
				} else {
					const res = await deliverymanService.read(context.dataloaders.user);

					if (res.code === 403 || !res.data) {
						return null
					}

					return res.data;
				}
			}
		},
		getDeliveries: {
			type: new GraphQLList(DeliveriesType),
			resolve: async (parent, args, context) => {
				if (!context.dataloaders.user) {
					return null;
				}

				const res = await deliveryService.read(context.dataloaders.user);

				if (!res.data) {
					return null
				}

				return res.data;
			}
		},
		getDishes: {
			type: new GraphQLList(DisheType),
			resolve: async () => {
				const res = await disheService.read();

				if (!res.data) {
					return null
				}

				return res.data;
			}
		},
		getMenus: {
			type: new GraphQLList(MenuType),
			resolve: async () => {
				const res = await menuService.read();

				if (!res.data) {
					return null
				}

				return res.data;
			}
		}
	}
});

const RootMutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		login: {
			type: LoginResponseType,
			args: {
				email: { type: new GraphQLNonNull(GraphQLString) },
				password: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve: async (parent, args, context) => {
				const auth = await userService.login(args.email, args.password);

				// On ajoute l'utilisateur dans le context de GraphQL grâce à dataloaders
				context.dataloaders.user = auth.user;

				return auth;
			}
		}
	}
});

const Schema = new GraphQLSchema({
	query: RootQuery,
	mutation: RootMutation
});

export default Schema;