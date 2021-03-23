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
  pdfDoc.setTitle('Justificatif ' + new Date().toDateString())
  pdfDoc.setCreator('')
  const page1 = pdfDoc.getPages()[0]

  const font = await pdfDoc.embedFont(StandardFonts.Courier)
  const drawText = (text, x, y, size = 11) => {
    page1.drawText(text, { x, y, size, font })
  }

  drawText(`M ${lastname.toUpperCase()} ${firstname.toUpperCase()}`, 300, 650)
  drawText(`${address}`, 300, 635)
  drawText(`${zipcode} ${city}`, 300, 620)

  drawText(`M ${lastname.toUpperCase()} ${firstname.toUpperCase()}`, 50, 470)
  drawText(`${address}`, 50, 455)
  drawText(`${zipcode} ${city}`, 50, 440)

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
