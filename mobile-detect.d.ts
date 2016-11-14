
declare class MobileDetect {
	static version: string;
	static isPhoneSized(maxPhoneWidth?: number): boolean;
	// only used internally; if necessary, one can replace, intercept or augment particular methods or values
	static _impl: MobileDetect.MobileDetectImpl;

	constructor(userAgent: string, maxPhoneWidth?: number);

	mobile(): string;
	phone(): string;
	tablet(): string;

	userAgent(): string;
	userAgents(): string[];
	os(): string;

	version(value: string): number;
	versionStr(value: string): string;

	is(key: string): boolean;
	match(pattern: string|RegExp): boolean;
	isPhoneSized(maxPhoneWidth?: number): boolean;
	mobileGrade(): string;
}

declare namespace MobileDetect {
	interface MobileDetectRules {
		[key: string]: string|RegExp;
	}

	interface MobileDetectComplexRules {
		[key: string]: string|RegExp|string[]|RegExp[];
	}

	interface MobileDetectImpl {
		mobileDetectRules: {
			phones: MobileDetectRules;
			tablets: MobileDetectRules;
			oss: MobileDetectRules;
			uas: MobileDetectRules;
			props: MobileDetectComplexRules;
			utils: MobileDetectRules;
		};
		detectMobileBrowsers: {
			fullPattern: RegExp;
			shortPattern: RegExp;
			tabletPattern: RegExp;
		};
		FALLBACK_PHONE: string;
		FALLBACK_TABLET: string;
		FALLBACK_MOBILE: string;

		findMatch(rules: MobileDetectRules, userAgent: string): string;
		findMatches(rules: MobileDetectRules, userAgent: string): string[];
		getVersionStr(propertyName: string, userAgent: string): string;
		getVersion(propertyName: string, userAgent: string): number;
		prepareVersionNo(version: string): number;
		isMobileFallback(userAgent: string): boolean;
		isTabletFallback(userAgent: string): boolean;
		prepareDetectionCache(cache: Object, userAgent: string, maxPhoneWidth?: number): void;
		mobileGrade(md: MobileDetect): string;
		detectOS(userAgent: string): string;
		getDeviceSmallerSide(): number;
	}
}

export = MobileDetect;

export as namespace MobileDetect;
