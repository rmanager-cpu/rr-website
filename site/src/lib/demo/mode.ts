/** Only the isolated booking preview opts in; production never does. */
export const isBookingDemo = () => process.env.VERCEL_ENV !== 'production' &&
  (process.env.VERCEL_GIT_COMMIT_REF === 'bookingcenter-demo' || process.env.BOOKING_DEMO_ONLY === 'true');
