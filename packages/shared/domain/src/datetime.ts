import { Data, Either, Schema as S, pipe } from 'effect'
import { Temporal } from 'temporal-polyfill'

export const TemporalZonedDateTime = Temporal.ZonedDateTime

/**
 * An experimental date time.
 *
 * Documentation at https://github.com/fullcalendar/temporal-polyfill.
 *
 * Get inspiration with EffectJS at https://github.com/PREreview/coar-notify/blob/main/src/Temporal.ts (it is `@js-temporal/polyfill` package)
 *
 * @example
 * const date1 = now()
 * const date2 = Temporal.Now.zonedDateTimeISO()
 */
export const ZonedDateTime = S.instanceOf(Temporal.ZonedDateTime)
export type ZonedDateTime = typeof ZonedDateTime.Type

/**
 * @deprecated
 * Get the current ZonedDateTime in ISO 8601 format.
 */
export const now = () => Temporal.Now.zonedDateTimeISO().toInstant()

/**
 * Get the current date time as an ISO 8601 string.
 */
export const currentIsoDateTimeString = () =>
	Temporal.Now.zonedDateTimeISO().toInstant().toString()

/**
 * Get the current date time as a ZonedDateTime.
 */
export const nowZoned = () => Temporal.Now.zonedDateTimeISO()

/**
 * ZonedDateTime as string
 */
export const ZonedDateTimeString = S.String.pipe(S.brand('ZonedDateTimeString'))
export type ZonedDateTimeString = typeof ZonedDateTimeString.Type

export class ErrorTemporal extends Data.TaggedError('ErrorTemporal')<{
	date: string
}> {}

/**
 * Cast a string to a `Temporal.ZonedDateTime`
 */
export function fromStringToTemporal(value: string) {
	return pipe(
		Either.try(() => Temporal.ZonedDateTime.from(value)),
		Either.orElse(() =>
			// If that fails, try to parse as Instant and convert to ZonedDateTime
			Either.try(() => {
				const instant = Temporal.Instant.from(value)
				return instant.toZonedDateTimeISO(Temporal.Now.timeZoneId())
			}),
		),
		Either.orElse(() =>
			// If that fails, try to parse as PlainDateTime and convert to ZonedDateTime
			Either.try(() => {
				const plainDateTime = Temporal.PlainDateTime.from(value)
				return plainDateTime.toZonedDateTime(Temporal.Now.timeZoneId())
			}),
		),
		Either.orElse(() =>
			// If all else fails, try to parse as PlainDate and convert to ZonedDateTime
			Either.try(() => {
				const plainDate = Temporal.PlainDate.from(value)
				return plainDate.toZonedDateTime({
					timeZone: Temporal.Now.timeZoneId(),
					plainTime: Temporal.PlainTime.from('00:00'),
				})
			}),
		),
		Either.mapLeft(() => new ErrorTemporal({ date: value })),
	)
}

/**
 * Cast a `Temporal.ZonedDateTime` to ISO 8601 string
 */
export function fromTemporalToString(value: Temporal.ZonedDateTime): string {
	return value.toInstant().toString()
}
