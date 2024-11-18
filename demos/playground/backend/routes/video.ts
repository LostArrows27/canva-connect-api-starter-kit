import express from "express";
import { DesignService, ExportService } from "@canva/connect-api-ts/ts/index";
import { injectClient } from "../../../common/backend/middleware/client";
import { db } from "..";

const router = express.Router();

router.use((req, res, next) => injectClient(req, res, next, db));

router.get("/design/list", async (req, res) => {
  const result = await DesignService.listDesigns({
    client: req.client,
    query: {
      query: "video",
    },
  });
  if (result.error) {
    return res.status(result.response.status).json(result.error);
  }
  return res.json(result.data);
});

router.get("/video/export", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing design ID" });
  }

  try {
    const result = await ExportService.createDesignExportJob({
      client: req.client,
      body: {
        design_id: id as string,
        format: {
          type: "mp4",
          quality: "horizontal_720p",
        },
      },
    });
    if (result.error) {
      return res.status(result.response.status).json(result.error);
    }

    const jobId = result.data?.job.id;

    return res.redirect(`/video/export/${jobId}`);
  } catch (error) {
    console.error("Error exporting video:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/video/export/:exportId", async (req, res) => {
  const { exportId } = req.params;
  if (!exportId) {
    return res.status(400).json({ error: "Missing export ID" });
  }

  try {
    const result = await ExportService.getDesignExportJob({
      client: req.client,
      path: {
        exportId,
      },
    });
    if (result.error) {
      return res.status(result.response.status).json(result.error);
    }

    return res.json(result.data);
  } catch (error) {
    console.error("Error getting export job:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
