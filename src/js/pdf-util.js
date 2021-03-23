import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import facturePdfBase from '../template.pdf'

let pdfBase = facturePdfBase
export async function generatePdf(profile) {

  const {
    lastname,
    firstname,
    address,
    zipcode,
    city
  } = profile

  const existingPdfBytes = await fetch(pdfBase).then((res) => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  // set pdf metadata
  pdfDoc.setTitle(new Date().toISOString())
  pdfDoc.setCreator('')
  const page1 = pdfDoc.getPages()[0]

  const addressFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const nameFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawAddressText = (text, x, y, size = 10) => {
    page1.drawText(text, { x, y, size, addressFont })
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

  drawNameText(`${lastname.toUpperCase()} ${firstname.toUpperCase()}`, 42, 453)

  drawText(`${address.toUpperCase()}, ${zipcode} ${city.toUpperCase()}.`, 42, 369)

  const pdfBytes = await pdfDoc.save()



  return new Blob([pdfBytes], { type: 'application/pdf' })
}


function getIdealFontSize(font, text, maxWidth, minSize, defaultSize) {
  let currentSize = defaultSize
  let textWidth = font.widthOfTextAtSize(text, defaultSize)

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize)
  }

  return textWidth > maxWidth ? null : currentSize
}
