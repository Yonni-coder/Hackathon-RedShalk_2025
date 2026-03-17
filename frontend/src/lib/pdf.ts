import PDFDocument from "pdfkit"
import { NextResponse } from "next/server"

export async function bookingReceiptPDF({
    booking,
    items,
}: {
    booking: any
    items: Array<{ name: string; hours: number; price: number }>
}) {
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const chunks: Buffer[] = []
    doc.on("data", (c) => chunks.push(c))
    const total = items.reduce((s, i) => s + i.price * i.hours, 0)


    doc.fontSize(18).text("Reçu de paiement", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Réservation #${booking.id}`)
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleString()}`)
    doc.text(`Client: ${booking.user?.name ?? booking.userId}`)


    doc.moveDown()
    items.forEach((it) => {
        doc.text(`${it.name} — ${it.hours}h × ${it.price.toLocaleString()} MGA`);
    })
    doc.moveDown()
    doc.fontSize(14).text(`Total: ${total.toLocaleString()} MGA`, { align: "right" })
    doc.end()

    const buf = Buffer.concat(chunks)
    return new NextResponse(buf, {
        headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=receipt-${booking.id}.pdf` ,
        },
    })
}