const router = require("express").Router();
const unit = require("../functions/unitController");
const flash = require("connect-flash");

router.use(flash());

router
	.post("/", async (req, res) => {
		const { unitName, unitCode, enrollmentKey } = req.body;

		const savedUnit = await unit.save(
			unitName,
			unitCode,
			enrollmentKey,
			req.user._id
		);
		if (!savedUnit.error) {
			req.flash("info", savedUnit.error);
		} else {
			req.flash("info", "Unit Saved Successfully!");
		}
		res.redirect("/dashboard");
	})
	.post("/delete", async (req, res) => {
		const { unitId } = req.body;
		const deletedUnit = unit.deleteUnit(unitId);
		res.json({ data: deletedUnit });
	})
	.post("/search", async (req, res) => {
		const { searchValue } = req.body;
		const theResults = await unit.getSearch(searchValue);
		res.json(theResults);
	});
module.exports = router;
