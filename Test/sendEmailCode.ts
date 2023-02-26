import nodemailer from "nodemailer"; // Créer un objet de transport pour se connecter à Outlook
const transport = nodemailer.createTransport({
  // host: "smtp-mail.outlook.com",
  host: "sandbox.smtp.mailtrap.io",
  // port: 587,
  port: 2525,
  // secure: false,
  // auth: { user: "wena.ui@outlook.com", pass: "Log('wena','ui');" },
  auth: { user: "1eedc3e8e694d8", pass: "a28c00ad2601f4" },
}); 

// Préparer les détails de l'email à envoyer


export function genereCode(){
  const randomNum = Math.floor(Math.random() * 100000);
  const numStr = randomNum.toString().padStart(5, '0');
  return numStr
}



export function sendEmail(email : string , name : string , code : string) : void {
    const mailOptions = {
      from: "wena.ui@outlook.com",
      to: email,
      subject: 'SKYPARK - Email Verification',
      html : `
        <div style="background-color: #f5f5f5; padding: 20px;">
          <div style="background-color: white; padding: 20px; border-radius: 10px;">
            <h1 style="color: #006699; text-align: center;">Bienvenue ${name} chez skypark</h1>
            <p style="font-size: 16px;">Merci d'avoir choisi skypark pour votre inscription.</p>
            <p style="font-size: 16px;">Pour activer votre compte, veuillez saisir le code de confirmation ci-dessous :</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #006699; text-align: center; margin-top: 0;">Code de confirmation : <strong>${code}</strong></h2>
            </div>
            <span style="font-size: 16px;">Ce code est valable pendant 24 heures. Merci de ne pas partager ce code avec quiconque.</span>
    
          </div>
        </div>`
      
    };
    // Envoyer l'email en utilisant l'objet de transport
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email envoyé: ${info.response}`);
      }
    });
}