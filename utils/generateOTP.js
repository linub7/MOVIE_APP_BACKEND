const generateOTP = (length = 6) => {
  let token = '';
  for (let index = 1; index <= length; index++) {
    const randomVal = Math.round(Math.random() * 9);
    token += randomVal;
  }
  return token;
};

module.exports = generateOTP;
