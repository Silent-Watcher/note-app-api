// these options can be added later: "sms"
type StepUpMethod = 'captchaV2';

export type RecaptchaAction = {
	type: 'allow' | 'stepUp' | 'manualReview';
	method?: StepUpMethod;
};

export interface RecaptchaThresholds {
	/** ≥ allow: go straight through */
	allow: number;
	/** ≥ stepUp and < allow: require second factor */
	stepUp: number;
	/** < stepUp: manual review */
}

export const DEFAULT_THRESHOLDS: RecaptchaThresholds = {
	allow: 0.7,
	stepUp: 0.3,
};

export function decideRecaptchaAction(
	score: number,
	thresholds: RecaptchaThresholds = DEFAULT_THRESHOLDS,
	stepUpMethod: StepUpMethod = 'captchaV2',
): RecaptchaAction {
	if (score >= thresholds.allow) {
		return { type: 'allow' };
	}

	if (score >= thresholds.stepUp && score < thresholds.allow) {
		return { type: 'stepUp', method: stepUpMethod };
	}

	return { type: 'manualReview' };
}
