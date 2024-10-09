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
	})
	.post("/announcement", async (req, res) => {
		const { announcementTitle, announcementDetails, unitId } = req.body;

		const savedAnnouncement = await unit.announcement.save(
			announcementTitle,
			announcementDetails,
			unitId
		);
		if (!savedAnnouncement.error) {
			if (savedAnnouncement) {
				req.flash("info", "Announcement Saved Successfully!");
			} else {
				req.flash("info", "Announcement Not Saved!");
			}
		} else {
			req.flash("info", savedAnnouncement.error);
		}
		res.redirect("/dashboard");
	})
	.get("/delete/:unitId/:id", async (req, res) => {
		const { unitId, id } = req.params;

		const deletedAnnouncement = await unit.announcement.delete(id, unitId);
		if (!deletedAnnouncement.error) {
			if (deletedAnnouncement) {
				req.flash("info", "Unit Updated Successfully!");
			}
		} else {
			req.flash("info", deletedAnnouncement.error);
		}
		req.flash("origin", unitId);
		res.redirect("/dashboard");
	});
module.exports = router;
