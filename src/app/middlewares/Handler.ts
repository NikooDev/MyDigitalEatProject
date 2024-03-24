import Middleware from '@Src/interfaces/Middleware';
import { RoleEnum } from '@Src/interfaces/User';
import Email from '@Middlewares/Email';
import Auth from '@Middlewares/Auth';
import Validator from '@Middlewares/Validator';

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
const isAll = Auth.isAll.bind(Auth);
const isCustomerOrRestaurant = Auth.isCustomerOrRestaurant.bind(Auth);
const isValidDatas = Validator.datas.bind(Validator);

export const MiddlewaresCustomer = {
	get: [isAuth, isCustomer],
	post: [isValidDatas, isUniqueEmail],
	put: [isAuth, isCustomer, isValidDatas, isUniqueEmail],
	delete: [isAuth, isCustomer]
} as Middleware;

export const MiddlewaresRestaurant = {
	get: [isAuth, isAll],
	post: [isValidDatas, isUniqueEmail],
	put: [isAuth, isRestaurant, isValidDatas, isUniqueEmail],
	delete: [isAuth, isRestaurant]
} as Middleware;

export const MiddlewaresDeliveryman = {
	get: [isAuth, isDeliveryman],
	post: [isValidDatas, isUniqueEmail],
	put: [isAuth, isDeliveryman, isValidDatas, isUniqueEmail],
	delete: [isAuth, isDeliveryman]
} as Middleware;

export const MiddlewaresDishe = {
	get: [isAuth, isAll],
	post: [isAuth, isRestaurant, isValidDatas],
	put: [isAuth, isRestaurant, isValidDatas],
	delete: [isAuth, isRestaurant]
} as Middleware;

export const MiddlewaresMenu = {
	get: [isAuth, isAll],
	post: [isAuth, isRestaurant, isValidDatas],
	put: [isAuth, isRestaurant, isValidDatas],
	delete: [isAuth, isRestaurant]
} as Middleware;

export const MiddlewaresDeliveries = {
	get: [isAuth, isAll],
	post: [isAuth, isCustomer, isValidDatas],
	put: [],
	delete: [isAuth, isCustomerOrRestaurant]
} as Middleware;