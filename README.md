# Api

To Generate a QRCode do a post reguest to https://qrcode-app-topaz.vercel.app/api/api

{

content: "Content of QRcode"

options: {
margin: 2,
errorCorrectionLevel: "M"
}

}

# Options (optional)

margin - white space around the code

errorCorrectionLevel - L | M | Q | H
