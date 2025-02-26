import otpGenerator from "otp-generator";

export default function generateOtp() {
  return otpGenerator.generate(6,{
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
}