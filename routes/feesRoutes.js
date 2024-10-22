const router = require("express").Router();
const flash = require("connect-flash");
const fees = require("../controllers/feesController");
const path = require("path");
// MIDDLEWARES

router.use(flash());

router
	.post("/upload", fees.upload.single("feesStructure"), async (req, res) => {
		try {
			const { file } = req;
			const { originalname, path } = file;
			const creator = req.user.username;

			const savedStructure = await fees.save(originalname, path, creator);
			if (!savedStructure.error) {
				req.flash("info", "Fees Structure Saved Successfully!");
			} else {
				req.flash("info", savedStructure.error);
			}

			res.redirect("/dashboard");
		} catch (error) {
			res
				.status(500)
				.json({ message: "Error uploading file", error: error.message });
		}
	})
	.get("/delete/:id", async (req, res) => {
		const { id } = req.params;
		const deletedStructure = await fees.delete(id);
		if (!deletedStructure.error) {
			req.flash("info", "Fees Structure Deleted Successfully!");
		} else {
			req.flash("info", deletedStructure.error);
		}
		res.redirect("/dashboard");
	})
	.get("/download/:id", async (req, res) => {
		try {
			const { id } = req.params;
			const structureFilePath = await fees.getPath(id);
			if (!structureFilePath.error) {
				const filePath = path.resolve(structureFilePath);
				res.download(filePath, (err) => {
					if (err) {
						console.error("Error downloading file", err);
						return res.status(500).json({ error: "Error downloading file" });
					}
				});
			}
		} catch (err) {
			console.error("Error fetching assignment", err);
			res.status(500).json({ error: "Server error" });
		}
	});
module.exports = router;
