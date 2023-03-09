const SERVICE_PLAN_ID = "3bf24df6004649fcb7728cf339d62c2a";
const API_TOKEN = "57425bda2cc9486e9f83ec359223d7ce";
const SINCH_NUMBER = "YOUR_Sinch_virtual_number";
const TO_NUMBER = "sender_number";
import { Vonage } from "@vonage/server-sdk";

export function genereCodePhone() {
  const randomNum = Math.floor(Math.random() * 1_000_000);
  const numStr = randomNum.toString().padStart(6, "0");
  return numStr;
}

const vonage = new Vonage({
  apiKey: "04618057",
  apiSecret: "zCusJj7LDpjyBmlp" 
});

export const sendCodePhone = (Tel: string, code: string) => {
  return new Promise<boolean>(async (res) => {
    const from = "Vonage APIs";
    const to = Tel;
    const text = "Test confirmation skypark is: " + code;
    await vonage.sms
      .send({ to, from, text })
      .then((resp) => {
        console.log("Message sent successfully");
        console.log(resp);
        res(true);
      })
      .catch((err) => {
        console.log("There was an error sending the messages.");
        console.error(err);
        res(false);
      });
  });
};
