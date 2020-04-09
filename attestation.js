/*********************************************************************************************
Auteur : Nicolas Chen
Nom du fichier : attestation.js
Version : 1.0.0
Date : 05/04/2020
But : Ce script permet de générer une attestation numérique de déplacement dérogatoire.
**********************************************************************************************/

const { PDFDocument, StandardFonts } = PDFLib

const $ = (...args) => document.querySelector(...args)
const $$ = (...args) => document.querySelectorAll(...args)
const signaturePad = new SignaturePad($('#field-signature'), { minWidth: 1, maxWidth: 3 })

function getProfileAttestation() {
  const fields = {}
  for (let i = 0; i < localStorage.length; i++){
    const name = localStorage.key(i)
    fields[name] = localStorage.getItem(name)
  }
  return fields
}

async function generatePdfAttestation(profile, justification) {
  const pdfDoc = await PDFDocument.load(attestationDeplacementPdf)
  const page = pdfDoc.getPages()[0]

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawText = (text, x, y, size = 11) => {
    page.drawText(text, {x, y, size, font})
  }

  drawText(`${profile.firstname} ${profile.name}`, 125, 685)
  drawText(profile.birthday, 125, 661)
  drawText(profile.birthplace || '', 95, 637)
  drawText(`${profile.address} ${profile.zipcode} ${profile.city}`, 140, 613)

  switch (justification) {
    case 'travail':
      drawText('x', 76.5, 526, 20)
      break
    case 'courses':
      drawText('x', 76.5, 476.5, 20)
      break
    case 'sante':
      drawText('x', 76.5, 436, 20)
      break
    case 'famille':
      drawText('x', 76.5, 399.5, 20)
      break
    case 'sport':
      drawText('x', 76.5, 344, 20)
      break
    case 'convocation':
      drawText('x', 76.5, 297, 20)
      break
    case 'mission':
      drawText('x', 76.5, 261, 20)
      break
  }

  drawText(profile['done-at'] || profile.city, 110, 225)

  if (justification !== '') {
    const date = [
      String((new Date).getDate()).padStart(2, '0'),
      String((new Date).getMonth() + 1).padStart(2, '0'),
      String((new Date).getFullYear()),
    ].join('/')

    drawText(date, 105, 201)
    drawText(String((new Date).getHours()).padStart(2, '0'), 195, 201)

    const minutes = Math.floor((new Date).getMinutes() / 5) * 5;
    drawText(String(minutes).padStart(2, '0'), 225, 201)
  }

  const signatureArrayBuffer = await fetch(profile.signature).then(res => res.arrayBuffer())
  const signatureImage = await pdfDoc.embedPng(signatureArrayBuffer)
  const signatureDimensions = signatureImage.scale(1 / (signatureImage.width / 80))

  page.drawImage(signatureImage, {
    x: page.getWidth() - signatureDimensions.width - 380,
    y: 130,
    width: signatureDimensions.width,
    height: signatureDimensions.height,
  })

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], {type: 'application/pdf'})
}

function downloadBlobAttestation(blob, fileName) {
  const link = document.createElement('a')
  var url = URL.createObjectURL(blob)
  link.href = url
  link.download = fileName
  link.click()
}

const formWidth = $('#form-attestation').offsetWidth
$('#field-signature').width = formWidth
$('#field-signature').height = formWidth / 1.5

$('#reset-signature').addEventListener('click', () => signaturePad.clear())


function getJustification() {
  var e = document.getElementById("selectID");
  var value = e.options[e.selectedIndex].value;
  return value
}


function saveProfileAttestation() {
  for (field of $$('#form-attestation input:not([disabled]):not([type=checkbox])')) {
    localStorage.setItem(field.id.substring('field-'.length), field.value) //données des champs.
  }

  localStorage.setItem('signature', signaturePad.toDataURL()) //la signature
}


$('#form-attestation').addEventListener('submit', async event => {
  event.preventDefault()

  const button = event.target.querySelector('button[type=submit]')
  button.disabled = true
  saveProfileAttestation()

  const profile = getProfileAttestation()
  const justification = getJustification()


  const pdfBlob = await generatePdfAttestation(profile, justification)
  button.disabled = false

  downloadBlobAttestation(pdfBlob, 'AttestationDeplacement.pdf')
})
