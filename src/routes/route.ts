import express from "express";
import { NinjaController } from "../controller/ninja.controller";
import { WebhookController } from "../controller/webhook.controller";
import { StatusOrderController } from "../controller/status-order.controller";
import { SicepatController } from "../controller/sicepat.controller";
import { JntController } from "../controller/jnt.controller";
import { RekonsiliasiController } from "../controller/rekonsiliasi.controller";
import { TagihanController } from "../controller/tagihan.controller";
import { ValidationKlaimController } from "../controller/validation-klaim";
import { IdexpressController } from "../controller/idexpress.controller";
import { JneController } from "../controller/jne.controller";
import { SapController } from "../controller/sap.controller";
import { RecommendationController } from "../controller/recommendation.controller";
import multer from "multer";
import OrderValidationController from "../controller/order-validation.controller";
import { TrackingController } from "../controller/tracking.controller";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./storage/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// route order
router.post("/recommendation/cek-tarif", RecommendationController.checkTarif);

router.post("/ninja/cek-tarif", NinjaController.checkTarif);
router.post("/ninja/generate", NinjaController.OrderNinja);
router.post("/ninja/tagihan", NinjaController.tagihan);
router.get("/ninja/token", NinjaController.showToken);
router.post("/ninja/rekonsiliasi", NinjaController.add);
router.post("/ninja/cancel", NinjaController.cancel);
router.post("/ninja/update-ooc", upload.single('file'), NinjaController.updateOOC);
router.post("/ninja/track-status", NinjaController.trackStatus);

// route order
router.post("/sicepat/cek-tarif", SicepatController.checkTarif);

// router.post("/sicepat/generate", SicepatController.OrderNinja);
// router.get("/sicepat/token", SicepatController.generateToken);

// route order
router.post("/jnt/cek-tarif", JntController.checkTarif);
// router.post("/sicepat/generate", SicepatController.OrderNinja);
// router.get("/sicepat/token", SicepatController.generateToken);

// route order idexpress
router.post("/idexpress/cek-tarif", IdexpressController.checkTariff);
router.post("/idexpress/generate", IdexpressController.createOrder);
router.post("/idexpress/cancel", IdexpressController.cancelOrder);
router.post("/idexpress/track-status", IdexpressController.trackStatus);

router.post("/sap/cek-tarif", SapController.checkTarif);
router.post("/sap/generate", SapController.createOrder);
router.post("/sap/cancel", SapController.cancel);
router.post("/sap/track-status", SapController.trackStatus)
router.post("/sap/tagihan", SapController.tagihan);
router.post("/sap/rekonsiliasi", SapController.add);

// route order jne
router.post("/jne/cek-tarif", JneController.checkTariff);
router.post("/jne/generate", JneController.createOrder);
router.post("/jne/cancel", JneController.cancelOrder);
router.post("/jne/track-status", JneController.trackStatus);
router.post("/jne/tagihan", JneController.tagihan);
router.post("/jne/rekonsiliasi", JneController.add);

router.post("/webhook/ninja", WebhookController.ninja);
router.post("/webhook/sap", WebhookController.sap);
router.post("/webhook/idexpress", WebhookController.idexpress);
router.post("/webhook/jne", WebhookController.jne);

router.get("/status-order/:order_id", StatusOrderController.statusOrder);

router.post("/mapping/tagihan", TagihanController.add);

router.post("/validation-klaim", ValidationKlaimController.add);

router.post("/order/validate", OrderValidationController.validate);

router.post("/tracking/no-update", TrackingController.trackingNotUpdate);


export default router;
