exports.secretUserForAdmin = (req, res) => {
  console.log(req.user);
  res.json({ message: 'secure only for admin' });
};

exports.secretUserForUser = (req, res) => {
  console.log(req.user);
  res.json({ message: 'secure only for user' });
};
