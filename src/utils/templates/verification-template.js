const verificationTemplate = (generateOtp, firstName) => {
  // const OTP = generateOtp(user.emailOtp);
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email otp</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Anek+Gurmukhi:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
          body{
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Anek Gurmukhi', sans-serif;
          }
          .email-otp{
              width: 50%;
              margin: 0 auto;
              margin-bottom: 42px;
          }
          .email-otp h1{
              font-weight: 500;
              line-height: 32px;
              font-size: 24px;
              text-align: start;
              margin-top: 15px;
          }
          .hi{
              font-size: 24px;
              line-height: 28px;
              font-weight: 400;
              text-align: start;
          }
          .email-otp h2{
              font-size: 50px;
              line-height: 62px;
              font-weight: 600;
              color: #333;
              margin: 0 auto;
              width: 489px;
          }
          .otp{
            font-size: 18px;
          }
          .click{
             width: 357px;
          }
          .get-app hr{
              width: 125px;
              margin: 0 auto;
              border: 1px solid rgba(0,0,0,0.24);
              margin-bottom: 16px;
          }
          .get-app h3{
              font-weight: 400;
              font-size: 24px;
              line-height: 32px;
              margin-bottom: 16px;
              text-align: center;
          }
          .get-app p{
              color: #666;
              width: 512px;
              margin: 0 auto;
              margin-bottom: 17px;
              text-align: center;
          }
          .store{
             text-align: center;
             margin: 0 auto;
             width: 90%;
             margin-bottom: 72px;
          }
          .store img{
              cursor: pointer;
              max-width: 100%;
          }
  
          .footer{
              width: 100%;
              height: 239px;
              background-image: url('https://res.cloudinary.com/dhekqilcw/image/upload/v1687596415/mgjj1n02ixqc9frk8h2x.png');
              background-size: cover;
          }
          .footer-socials{
            width: 100px;
              padding-top: 64.69px;
              margin:0 auto;
              margin-bottom: 19.74px;
              gap: 28px;
              text-align: center;
        }
          .logo{
             margin: 0 auto;
             display: block;
             margin-bottom: 10px; 
          }
          .footer p{
              font-weight: 400;
              line-height: 16px;
              font-size: 12px;
              text-align: center;
          }
          @media screen and (max-width: 1024px) {
              .email-otp{
                  width: 85%;
              }
          }
          @media screen and (max-width: 640px) {
              .email-otp h1{
                  font-size: 14px;
              }
              .hi{
                  font-size: 18px;
              }
              .email-otp h2{
                  font-size: 24px;
  
                  width: 100%;
              }
              .click{
                  width: 100%;
              }
              .get-app p{
                  width: 90%;
              }
              
          }
      </style>
  </head>
  <body>
      <div>
          <div class='email-otp'>
              <p class='hi'>Hi ${firstName}, </p>
              <h2>Verification Pin</h2>
              <p>Please verify your email by entering this pin on the verification page</p>
              <p class="otp">${generateOtp?.toString()}</p>
          </div>
          <div class="get-app">
              <hr/>
              <h3>Get the Savey app!</h3>
              <p>Get the most of Savey by installing the mobile app. You can log in by using your existing emails address and password.</p>
              <div class='store'>
                  <img src='https://res.cloudinary.com/dhekqilcw/image/upload/v1690635292/Group_dvmkgi.png' alt='app store logo'  />
                  <img src='https://res.cloudinary.com/dhekqilcw/image/upload/v1690635312/googleplay_ymmdxj.png' alt='google store logo' />
              </div>
          </div>
          
          <div class='footer'>
              <div class='footer-socials'>
                <img src="https://res.cloudinary.com/dhekqilcw/image/upload/v1688986596/twitterlogo_w6imak.png" alt="twitter">
                <img src="https://res.cloudinary.com/dhekqilcw/image/upload/v1688986679/facebooklogo_iyntcg.png" alt="facebook">
                <img src="https://res.cloudinary.com/dhekqilcw/image/upload/v1688986662/linkedin_yzexwx.png" alt="linkedin">
              </div>
              <img src='https://res.cloudinary.com/dhekqilcw/image/upload/v1688986634/saveylogo_fekkxc.png' alt="savey logo" class='logo'/>
              <p>Copyright &copy; 2023</p>
              <p>Savey gives financial security.</p>
              <p>Your journey into financial freedom and accountability is here.</p>
              
          </div>
      </div> 
  </body>
  </html>`;
};

export default verificationTemplate;
