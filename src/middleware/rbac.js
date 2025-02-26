const roleBasedAccess = (roles) => {
  return function (req, res, next) {
      if (roles.includes(req.admin.role)) {
        console.log(req.admin);
        next();
      } else {
        return res.json({ message: "Permission Denied" });
      }
  };
};

export default roleBasedAccess;
