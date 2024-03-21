import Middleware from '@Src/interfaces/Middleware';
import { RoleEnum } from '@Src/interfaces/User';
import Email from '@Middlewares/Email';
import Auth from '@Middlewares/Auth';

/*
|--------------------------------------------------------------------------
| Déclaration des middlewares
|--------------------------------------------------------------------------
*/

const isUniqueEmail = Email.isUnique.bind(Email);

const isAuth = Auth.isAuth.bind(Auth);
const isCustomer = Auth.isRole(RoleEnum.CUSTOMER).bind(Auth);
const isRestaurant = Auth.isRole(RoleEnum.RESTAURANT).bind(Auth);
const isDeliveryman = Auth.isRole(RoleEnum.DELIVERYMAN).bind(Auth);
const isAll = Auth.isAll;
const isCustomerOrRestaurant = Auth.isCustomerOrRestaurant;

export const MiddlewaresCustomer = {
	get: [isAuth, isAll],
	post: [isUniqueEmail],
	put: [isAuth, isCustomer, isUniqueEmail],
	delete: [isAuth, isCustomer]
} as Middleware;

export const MiddlewaresRestaurant = {
	get: [isAuth, isAll],
	post: [isUniqueEmail],
	put: [isAuth, isRestaurant, isUniqueEmail],
	delete: [isAuth, isRestaurant]
} as Middleware;

export const MiddlewaresDeliveryman = {
	get: [isAuth, isAll],
	post: [isUniqueEmail],
	put: [isAuth, isDeliveryman, isUniqueEmail],
	delete: [isAuth, isDeliveryman]
} as Middleware;

export const MiddlewaresDishe = {
	get: [isAuth, isAll],
	post: [isAuth, isRestaurant],
	put: [isAuth, isRestaurant],
	delete: [isAuth, isRestaurant]
} as Middleware;

export const MiddlewaresMenu = {
	get: [isAuth, isAll],
	post: [isAuth, isRestaurant],
	put: [isAuth, isRestaurant],
	delete: [isAuth, isRestaurant]
} as Middleware;

export const MiddlewaresDeliveries = {
	get: [isAuth, isAll],
	post: [isAuth, isCustomer],
	put: [],
	delete: [isAuth, isCustomerOrRestaurant]
} as Middleware;