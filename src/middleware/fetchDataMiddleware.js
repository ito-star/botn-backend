import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  var token = req.headers['accept-access-token'];
  console.log("token", token)
  if (!token) {
    next();
  }
  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) {
      next()
    }
    console.log(decoded)
    req.body._email = decoded.email
    next();
  });
}