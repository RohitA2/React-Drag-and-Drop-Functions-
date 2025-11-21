import BankIDSignFlow from "./BankIDSignFlow";

export default function BankIDSignPage(){
  const params = new URLSearchParams(window.location.search);
  
  const sessionId = params.get("sessionId");
  const qr = params.get("qr");

  return (
    <BankIDSignFlow 
      sessionId={sessionId}
      qrCodeLink={qr}
    />
  );
}
