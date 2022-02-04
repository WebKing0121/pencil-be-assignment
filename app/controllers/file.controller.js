exports.upload = (req, res) => {
  if (req.file)
    res.status(200).send({
      path: req.file.path,
    });
  else res.status(500).send("Error in uploading file to disk");
};

exports.download = (req, res) => {
  const identifier = req.query.identifier;
  if (!identifier) {
    return res.status(404).send("File path is missing!");
  } else {
    res.download(identifier);
  }
};
