import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import facturePdfBase1 from '../template1.pdf'
import facturePdfBase2 from '../template2.pdf'


export async function generatePdf(profile, contract) {

  const {
    lastname,
    firstname,
    address,
    zipcode,
    city
  } = profile

  const existingPdfBytes = await fetch([facturePdfBase1, facturePdfBase2][contract]).then((res) => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  // set pdf metadata
  pdfDoc.setTitle(new Date().toISOString())
  pdfDoc.setCreator('')
  const page1 = pdfDoc.getPages()[0]

  const clientNumber = randomIntFromInterval(10000000, 99999999).toString();
  const contractNumber = randomIntFromInterval(100000000000, 999999999999).toString();
  const subNumber = contractNumber.substr(0, 8) + "E";


  let addressFont = undefined;
  if (contract === 0) {
    addressFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  }
  if (contract === 1) {
    addressFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  }
  const nameFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawAddressText = (text, x, y, size = 10) => {
    page1.drawText(text, { x, y, size, addressFont })
  }
  const drawContractText = (text, x, y, size = 9) => {
    page1.drawText(text, { x, y, size, nameFont })
  }
  const drawNameText = (text, x, y, size = 10) => {
    page1.drawText(text, { x, y, size, nameFont })
  }
  const drawText = (text, x, y, size = 10) => {
    page1.drawText(text, { x, y, size, textFont })
  }


  drawAddressText(`M. ${lastname.toUpperCase()} ${firstname.toUpperCase()}`, 300, 650)
  drawAddressText(`${address.toUpperCase()}`, 300, 635)
  drawAddressText(`${zipcode} ${city.toUpperCase()}`, 300, 620)

  if (contract === 0) {
    drawContractText(`${clientNumber}`, 189, 568)
    drawContractText(`${subNumber}`, 189, 558)
    drawContractText(`${contractNumber}`, 189, 548)
    drawNameText(`${lastname.toUpperCase()} ${firstname.toUpperCase()}`, 42, 453)
    drawText(`${address.toUpperCase()}, ${zipcode} ${city.toUpperCase()}.`, 42, 369)
  }

  if (contract === 1) {
    drawAddressText(`${contractNumber}`, 115, 555)
    drawAddressText(`${address.toUpperCase()}`, 120, 520)
    drawAddressText(`${zipcode} ${city.toUpperCase()}`, 120, 505)
  }

  const pdfBytes = await pdfDoc.save()

  return new Blob([pdfBytes], { type: 'application/pdf' })
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getIdealFontSize(font, text, maxWidth, minSize, defaultSize) {
  let currentSize = defaultSize
  let textWidth = font.widthOfTextAtSize(text, defaultSize)

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize)
  }

  return textWidth > maxWidth ? null : currentSize
}
