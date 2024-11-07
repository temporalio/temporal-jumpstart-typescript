import express, { type Router, Request, Response, NextFunction } from 'express'

export const router: Router = express.Router()

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  next()
})
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  next()
})
