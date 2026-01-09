const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const verifyRoles = (roleAllowed) => {
  return (req, res, next) => {
    const errorMessages = [
      "يرجى تسجيل الدخول",
      "ليس لديك الصلاحية لهذا الإجراء",
    ];
    console.log(req.user);
    if (!req?.user?.userData?.role) throw new ApiError(errorMessages[0], 401);
    const userRole = req?.user?.userData?.role;

    const isRoleUserAllowed = () => {
      const arrOfUserRole = userRole;
      const arrOfRoleAllowed = String(roleAllowed.split(" "));
      return arrOfUserRole.some((role) => arrOfRoleAllowed.includes(role));
    };

    if (!isRoleUserAllowed()) throw new ApiError(errorMessages[1], 401);

    console.log("ended => verifyRoles");
    next();
  };
};

module.exports = verifyRoles;
