import { Router } from 'express'
import verifyToken from 'middleware/authMiddleware'
import fetchTokenData from 'middleware/fetchDataMiddleware'
import * as CalculationController from 'api/controller/deals-controller';
const router = Router()
router.post('/insert', verifyToken, CalculationController.insertDeal_post);
router.post('/delete', verifyToken, CalculationController.deleteDeal_delete);
router.post('/update', verifyToken, CalculationController.updateDeal_post);
router.post('/shareDeal', verifyToken, CalculationController.shareDeal_post)
router.get('/fetchEmailListForSearchQuery', CalculationController.fetchEmailListForSearchQuery_get)
router.get('/getSingleSharedDealData', fetchTokenData, CalculationController.getSingleSharedDealData_get)
router.get('/getAllSharedDealsOfUser', verifyToken, CalculationController.getAllSharedDealsOfUser_get)
export default router