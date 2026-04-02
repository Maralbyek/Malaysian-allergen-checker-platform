import { router } from './init'
import { authRouter } from './routers/auth'
import { consumerRouter } from './routers/consumer'
import { vendorRouter } from './routers/vendor'
import { adminRouter } from './routers/admin'

export const appRouter = router({
  auth: authRouter,
  consumer: consumerRouter,
  vendor: vendorRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
