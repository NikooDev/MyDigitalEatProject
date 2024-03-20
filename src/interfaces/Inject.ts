interface InjectType {
	decorator: (target: Object, propertyKey: string | symbol) => void;
}

export default InjectType;