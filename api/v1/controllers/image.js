const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const MAX_WIDTH_LG = 1280;
const MAX_WIDTH_MD = 720;
const MAX_WIDTH_SM = 360;

const MAX_HEIGHT_LG = 960;
const MAX_HEIGHT_MD = 540;
const MAX_HEIGHT_SM = 270;

function resize(width, height) {
  var dimensions = {
    widthLG: MAX_WIDTH_LG,
    heightLG: MAX_HEIGHT_LG,
    widthMD: MAX_WIDTH_MD,
    heightMD: MAX_HEIGHT_MD,
    widthSM: MAX_WIDTH_SM,
    heightSM: MAX_HEIGHT_SM,
  };
  if (width > height) {
    // landscape image
    if (width > MAX_WIDTH_LG) {
      const toRemove = (width - MAX_WIDTH_LG) / MAX_WIDTH_LG;
      const heightToRemove = (height * toRemove) / (toRemove + 1);
      const widthToRemove = (width * toRemove) / (toRemove + 1);
      dimensions.heightLG = height - heightToRemove;
      dimensions.widthLG = width - widthToRemove;
    }

    if (width > MAX_WIDTH_MD) {
      const toRemove = (width - MAX_WIDTH_MD) / MAX_WIDTH_MD;
      const heightToRemove = (height * toRemove) / (toRemove + 1);
      const widthToRemove = (width * toRemove) / (toRemove + 1);
      dimensions.heightMD = height - heightToRemove;
      dimensions.widthMD = width - widthToRemove;
    }

    if (width > MAX_WIDTH_SM) {
      const toRemove = (width - MAX_WIDTH_SM) / MAX_WIDTH_SM;
      const heightToRemove = (height * toRemove) / (toRemove + 1);
      const widthToRemove = (width * toRemove) / (toRemove + 1);
      dimensions.heightSM = height - heightToRemove;
      dimensions.widthSM = width - widthToRemove;
    }
  } else {
    // portrait image
    if (height > MAX_HEIGHT_LG) {
      const toRemove = (height - MAX_HEIGHT_LG) / MAX_HEIGHT_LG;
      const heightToRemove = (height * toRemove) / (toRemove + 1);
      const widthToRemove = (width * toRemove) / (toRemove + 1);
      dimensions.heightLG = height - heightToRemove;
      dimensions.widthLG = width - widthToRemove;
    }

    if (height > MAX_HEIGHT_MD) {
      const toRemove = (height - MAX_HEIGHT_MD) / MAX_HEIGHT_MD;
      const heightToRemove = (height * toRemove) / (toRemove + 1);
      const widthToRemove = (width * toRemove) / (toRemove + 1);
      dimensions.heightMD = height - heightToRemove;
      dimensions.widthMD = width - widthToRemove;
    }

    if (height > MAX_HEIGHT_SM) {
      const toRemove = (height - MAX_WIDTH_SM) / MAX_WIDTH_SM;
      const heightToRemove = (height * toRemove) / (toRemove + 1);
      const widthToRemove = (width * toRemove) / (toRemove + 1);
      dimensions.heightSM = height - heightToRemove;
      dimensions.widthSM = width - widthToRemove;
    }
  }

  return dimensions;
}

module.exports.uploadImage = async (req, res, prefixUrl) => {
  // console.log(resize());

  // Everything went fine.
  console.log(req.file);
  const fileExtension = path.extname(req.file.filename).replace(".", "");
  console.log(fileExtension);

  if (
    fileExtension == "png" ||
    fileExtension == "jpg" ||
    fileExtension == "jpeg"
  ) {
    const newName = require("crypto").randomBytes(5).toString("hex");

    const imageFile = await sharp(req.file.path);

    var dimensions;

    await imageFile.metadata().then(({ width, height }) => {
      // console.log(width);
      // console.log(height);
      dimensions = resize(width, height);
      console.log(dimensions);
    });

    await imageFile
      .resize(Math.floor(dimensions.widthSM), Math.floor(dimensions.heightSM))
      .jpeg({ quality: 70 })
      .toFile(
        path.join(req.file.destination, newName + "_sm." + fileExtension)
      );

    await imageFile
      .resize(Math.floor(dimensions.widthMD), Math.floor(dimensions.heightMD))
      .jpeg({ quality: 65 })
      .toFile(
        path.join(req.file.destination, newName + "_md." + fileExtension)
      );

    await sharp(req.file.path)
      .resize(Math.floor(dimensions.widthLG), Math.floor(dimensions.heightLG))
      .jpeg({ quality: 65 })
      .toFile(
        path.join(req.file.destination, newName + "_lg." + fileExtension)
      );

    await fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
    });

    return res.json({
      status: "success",
      message: "Image uploaded!",
      filePath: `${prefixUrl}/${newName}.${fileExtension}`,
    });
  } else {
    await fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
    });
    return res.status(400).json({
      status: "failed",
      message: "Only png, jpg and jpeg files are accepted",
    });
  }
};
