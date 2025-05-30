exports.authenticateFirebaseToken = async (req, res, next) => {
  const {auth} = require('firebase-admin');

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).send('Unauthorized');
  }
};