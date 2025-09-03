"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFileOrJson = void 0;
const uploadProfile_1 = require("../app/middlewares/uploadProfile");
const parseFormData_1 = require("./parseFormData");
const handleFileOrJson = (options = {}) => {
    const { fileField, multiple = false, maxCount = 10, jsonField = "data" } = options;
    return (req, res, next) => {
        const contentType = req.headers["content-type"] || "";
        if (contentType.startsWith("multipart/form-data") && fileField) {
            // Choose multer method based on single or multiple
            const uploadFn = multiple ? uploadProfile_1.uploadProfile.array(fileField, maxCount) : uploadProfile_1.uploadProfile.single(fileField);
            uploadFn(req, res, (err) => {
                if (err)
                    return next(err);
                (0, parseFormData_1.parseFormDataJson)(jsonField)(req, res, next);
            });
        }
        else {
            // For raw JSON requests, skip multer
            next();
        }
    };
};
exports.handleFileOrJson = handleFileOrJson;
