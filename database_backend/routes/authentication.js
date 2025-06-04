exports.authenticateFirebaseToken = async (req, res, next) => {
  const {auth} = require('firebase-admin');

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({
      message: 'Unauthorized! No token provided.'
    });
  }  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send({
      message: 'Unauthorized! Invalid or expired token.'
    });
  }
};