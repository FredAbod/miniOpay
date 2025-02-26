const fgPasswordTemplate = (OTP)=>{
    return`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset password</title>
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
            .reset{
                width: 50%;
                margin: 0 auto;
            }
            .reset h1{
                font-weight: 500;
                line-height: 32px;
                font-size: 24px;
                text-align: start;
                margin-top: 15px;
                margin-bottom: 44px;
            }
            .hi{
                font-size: 24px;
                line-height: 28px;
                font-weight: 400;
                text-align: start;
                margin-bottom: 63px;
            }
            .reset h2{
                font-size: 50px;
                line-height: 62px;
                font-weight: 600;
                color: #333;
                text-align: center;
                margin: 0 auto;
                margin-bottom: 34px;
                width: 489px;
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
               display: flex;
               justify-content: center;
               align-items: center;
               gap: 24px;
               margin-bottom: 72px;
            }
            .store img{
                display: block;
                cursor: pointer;
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
            @media screen and (max-width: 640px) {
                .reset{
                    width: 90%;
                }
                .reset h1{
                    font-size: 14px;
                }
                .hi{
                    font-size: 18px;
                }
                .reset h2{
                    font-size: 40px;
                    width: 100%;
                }
                .reset button{
                    width: 100%;
                }
                .get-app p{
                    width: 90%;
                }
                .store{
                    flex-direction: column;
                }
            }
            @media screen and (max-width: 1024px) {
                .reset{
                    width: 70%;
                }
            }
        </style>
    </head>
    <body>
        <div>
            <div class='reset'>
                <h1><span style='font-weight: 700'></span>Reset Your Password</h1>
                <p>You’re receiving this email because you’ve requested to reset your password. To proceed with the password reset, please enter the following One-Time Password (OTP) within the next 10 minutes,If you did not send this request, You can safely delete this email</p>
                <h2>${OTP}</h2>
              </div>
            <div class="get-app">
                <hr/>
                <h3>Get the Savey app!</h3>
                <p>Get the most of Savey by installing the mobile app. You can log in by using your existing emails address and password.</p>
                <div class='store'>
                    <img src='https://res.cloudinary.com/dhekqilcw/image/upload/v1687788964/xg1xs3cexaebxvabynr8.png' alt='app store logo'  />
                    <img src='https://res.cloudinary.com/dhekqilcw/image/upload/v1687788966/qnjqvcftrlqvztl6bqv1.png' alt='google store logo' />
                </div>
            </div>
            <div class='footer'>
                <div class='footer-socials'>
                  <img src="https://res.cloudinary.com/dhekqilcw/image/upload/v1687596407/fnvj5pmcywrosk1qogqy.svg" alt="twitter">
                  <img src="https://res.cloudinary.com/dhekqilcw/image/upload/v1687596404/ploqnz1twz1nssfcpwem.svg" alt="facebook">
                  <img src="https://res.cloudinary.com/dhekqilcw/image/upload/v1687596409/j11hogiyk7bz7cugv7i9.svg" alt="linkedin">
                </div>
                <img src='https://res.cloudinary.com/dhekqilcw/image/upload/v1687596412/ivtj1tkeuavwky5sh2ih.svg' alt="savey logo" class='logo'/>
                <p>Copyright &copy; 2023</p>
                <p>Savey gives financial security.</p>
                <p>Your journey into financial freedom and accountability is here.</p>
                
            </div>
        </div> 
    </body>
    </html>`
};

export default fgPasswordTemplate;