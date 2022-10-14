const express = require("express");

const userController = require("../controller/userController");
const router = express.Router();

router
  .route("/users")
  .get(userController.verifyToken, userController.getAllUsers);

router.route("/signup").post(userController.signup);
router.route("/login").post(userController.login);

router
  .route("/updateMe")
  .patch(
    userController.verifyToken,
    userController.uploadUserPhoto,
    userController.updateMe
  );

module.exports = router;
