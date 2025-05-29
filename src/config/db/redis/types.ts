export type RedisSetOptions = {
	EX?: number;
	PX?: number;
	EXAT?: number;
	PXAT?: number;
	NX?: boolean;
	XX?: boolean;
	KEEPTTL?: boolean;
	GET?: boolean;
};
