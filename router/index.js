const { uploadFile, getFileList, deleteFile, getAnswer } = require("../controller/file");

const express = require("express");
const router = express.Router();

router.route("/upload-file").post(uploadFile);
router.route("/delete-file").post(deleteFile);
router.route("/files").post(getFileList);
router.route("/get-answer").post(getAnswer);

module.exports = router;