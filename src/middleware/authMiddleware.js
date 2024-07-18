import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  var token = req.headers['accept-access-token'];
  console.log("token", token)
  if (!token) {
    return res.status(401).send({ auth: false, message: 'No token provided.' });
  }
  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) {
      return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
    }
    console.log(decoded)
    req.body._id = decoded.userId
    next();
  });
}

