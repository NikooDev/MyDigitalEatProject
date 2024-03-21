export enum RoleEnum {
	CUSTOMER = 'CUSTOMER',
	DELIVERYMAN = 'DELIVERYMAN',
	RESTAURANT = 'RESTAURANT'
}

export enum StatusEnum {
	AVAILABLE = 'AVAILABLE',
	UNAVAILABLE = 'UNAVAILABLE',
	ON_DELIVERY = 'ON_DELIVERY'
}

export interface UserType {
	id?: number
	email: string
	password: string
	name: string
	phone: string
	role: RoleEnum
	created_at: Date
	updated_at: Date
}

export interface CustomerType {
	id?: number
	user_id: number
	address: string
	user: UserType
}

export interface DeliverymanType {
	id?: number
	user_id: number
	status: StatusEnum
	address: string
	user: UserType
}

export interface RestaurantType {
	id?: number
	user_id: number
	card_id: number
	description: string
	address: string
	user: UserType
}