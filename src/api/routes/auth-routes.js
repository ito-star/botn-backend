import { Router } from 'express'
import verifyToken from 'middleware/authMiddleware'
import { signup_post, user_delete, login_post, verify_signup, getUserData, forgot_password, verify_forgotPassword, clearAllVerifiedUser, clearAllUnverifiedUser, googleLogin } from 'api/controller/auth-controller';
const router = Router()
router.post('/signup', signup_post);
router.delete('/deleteUser', user_delete);
router.post('/login', login_post);
router.post('/verifySignup', verify_signup);
router.post('/forgotPassword', forgot_password);
router.post('/verifyForgotPassword', verify_forgotPassword);
router.post('/clearAllVerifiedUser', clearAllVerifiedUser);
router.post('/clearAllUnverifiedUser', clearAllUnverifiedUser);
router.post('/googleLogin', googleLogin)
router.get('/getUserData', verifyToken, getUserData)

export default router