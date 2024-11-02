const router = require("express").Router();
const flash = require("connect-flash");
const deferment = require("../controllers/defermentController");

router.use(flash());

router
	.post("/save", async (req, res) => {
		const { reason } = req.body;
		const savedDefermentRequest = await deferment.save(
			req.user.username,
			req.user._id,
			reason
		);
		if (!savedDefermentRequest.error) {
			req.flash("info", "Deferment Request Sent Successfully!");
		} else {
			req.flash("info", savedDefermentRequest.error);
		}
		res.redirect("/dashboard");
	})
	.post("/delete/:id", async (req, res) => {
		const { id } = req.params;
		const deletedDefermentRequest = await deferment.delete(id);
		if (!deletedDefermentRequest.error) {
			req.flash("info", "Deferment Request Deleted Successfully!");
		} else {
			req.flash("info", deletedDefermentRequest.error);
		}
		res.redirect("/dashboard");
	})
	.get("/approve/:id", async (req, res) => {
		const { id } = req.params;
		const approvedRequest = await deferment.approve(id);
		if (!approvedRequest.error) {
			req.flash("info", "Deferment Request Updated Successfully!");
		} else {
			req.flash("info", approvedRequest.error);
		}
		res.redirect("/dashboard");
	});

module.exports = router;
