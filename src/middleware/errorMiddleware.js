export const notFound = (req, res, next) => {
  const error = new Error('Not found - ${req.originalUrl}')
  res.status(404)
  next(error)
}

export const errorHandler = (err, req, res, next) => {
  // console.log('error handler', err.status, err)
  const statusCode = err.status ? err.status : 500
  // const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  })
  next();
}
