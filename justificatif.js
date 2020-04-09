/*********************************************************************************************
Auteur : Nicolas Chen
Nom du fichier : justificatif.js
Version : 1.0.0
Date : 05/04/2020
But : Ce script permet de générer un justificatif numérique de déplacement professionnel.
**********************************************************************************************/

function getProfileJustificatif() {
  const fields = {}
  for (let i = 0; i < localStorage.length; i++){
    const name = localStorage.key(i)
    fields[name] = localStorage.getItem(name)
  }
  return fields
}

async function generatePdfJustificatif(profile) {
  const pdfDoc = await PDFDocument.load(justificatifDeplacementProPdf)
  const page = pdfDoc.getPages()[0]

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawText = (text, x, y, size = 11) => {
    page.drawText(text, {x, y, size, font})
  }

  drawText(`${profile.firstnameCompany} ${profile.nameCompany}`, 225, 659)
  drawText(profile.functions, 128, 635)
  drawText(profile.firstname, 128, 539)
  drawText(profile.name, 128, 515)
  drawText(profile.birthday, 180, 491)
  drawText(profile.birthplace, 180, 467)
  drawText(`${profile.address} ${profile.zipcode} ${profile.city}`, 180, 443)
  drawText(profile.job, 250, 419)
  drawText(profile.workplace, 290, 395)
  drawText(profile.transport, 200, 371)
  drawText(profile.validityTime, 180, 347)
  drawText(profile['done-at'] || profile.city, 120, 262)

    const date = [
      String((new Date).getDate()).padStart(2, '0'),
      String((new Date).getMonth() + 1).padStart(2, '0'),
      String((new Date).getFullYear()),
    ].join('/')

    drawText(date, 105, 238)

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], {type: 'application/pdf'})
}

function downloadBlobJustificatif(blob, fileName) {
  const link = document.createElement('a')
  var url = URL.createObjectURL(blob)
  link.href = url
  link.download = fileName
  link.click()
}

function saveProfileJustificatif() {
  for (field of $$('#form-justificatif input:not([disabled]):not([type=checkbox])')) {
    localStorage.setItem(field.id.substring('field-'.length), field.value) //données des champs.
  }
}

$('#form-justificatif').addEventListener('submit', async event => {
  event.preventDefault()

  const button = event.target.querySelector('button[type=submit]')
  button.disabled = true
  saveProfileJustificatif()

  const profile = getProfileJustificatif()

  const pdfBlob = await generatePdfJustificatif(profile)
  button.disabled = false

  downloadBlobJustificatif(pdfBlob, 'JustificatifDeplacementPro.pdf')
})
