const router  = require("express").Router();
const ctrl    = require("../controllers/profile.controller");
const { protect } = require("../middleware/auth.middleware");
const upload  = require("../config/multer");

router.use(protect);

router.post("/", ctrl.createProfile);
router.get("/me", ctrl.getMyProfile);
router.put("/me", ctrl.updateProfile);
router.post("/me/image", upload.single("image"), ctrl.uploadProfileImage);

router.post  ("/me/degrees",     ctrl.addDegree);
router.put   ("/me/degrees/:id", ctrl.updateDegree);
router.delete("/me/degrees/:id", ctrl.deleteDegree);

router.post  ("/me/certifications",     ctrl.addCertification);
router.put   ("/me/certifications/:id", ctrl.updateCertification);
router.delete("/me/certifications/:id", ctrl.deleteCertification);

router.post  ("/me/licences",     ctrl.addLicence);
router.put   ("/me/licences/:id", ctrl.updateLicence);
router.delete("/me/licences/:id", ctrl.deleteLicence);

router.post  ("/me/courses",     ctrl.addCourse);
router.put   ("/me/courses/:id", ctrl.updateCourse);
router.delete("/me/courses/:id", ctrl.deleteCourse);

router.post  ("/me/employment",     ctrl.addEmployment);
router.put   ("/me/employment/:id", ctrl.updateEmployment);
router.delete("/me/employment/:id", ctrl.deleteEmployment);

module.exports = router;
