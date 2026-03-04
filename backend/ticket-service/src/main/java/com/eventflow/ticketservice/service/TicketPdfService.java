package com.eventflow.ticketservice.service;

import com.eventflow.ticketservice.client.EventServiceClient;
import com.eventflow.ticketservice.model.Ticket;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

/**
 * Generates a PDF ticket with an embedded QR code for a given booking.
 *
 * <p>Architecture note: This functionality lives inside the existing ticket-service
 * because the service already owns the ticket data and has a client for the event-service.
 * No new microservice is required.</p>
 */
@Service
public class TicketPdfService {

  private final TicketService ticketService;
  private final EventServiceClient eventServiceClient;

  // Brand color: indigo-600 (#4F46E5)
  private static final float[] COLOR_BRAND     = {79f / 255f, 70f / 255f, 229f / 255f};
  private static final float[] COLOR_BRAND_LIGHT = {238f / 255f, 242f / 255f, 255f / 255f};
  private static final float[] COLOR_TEXT_DARK = {17f / 255f, 24f / 255f, 39f / 255f};
  private static final float[] COLOR_TEXT_MUTED = {107f / 255f, 114f / 255f, 128f / 255f};
  private static final float[] COLOR_SUCCESS   = {21f / 255f, 128f / 255f, 61f / 255f};
  private static final float[] COLOR_WHITE     = {1f, 1f, 1f};
  private static final float[] COLOR_BORDER    = {226f / 255f, 232f / 255f, 240f / 255f};

  public TicketPdfService(TicketService ticketService, EventServiceClient eventServiceClient) {
    this.ticketService = ticketService;
    this.eventServiceClient = eventServiceClient;
  }

  /**
   * Generates a PDF ticket document for the given ticket ID.
   *
   * @param ticketId the UUID of the ticket
   * @return a byte array containing the PDF document
   */
  public byte[] generateTicketPdf(UUID ticketId) {
    Ticket ticket = ticketService.get(ticketId);

    // Fetch event details from event-service
    Map<String, Object> event = eventServiceClient.getEvent(ticket.getEventId());
    String eventTitle    = getValue(event, "title",    "Event");
    String eventDate     = getValue(event, "date",     "");
    String eventTime     = getValue(event, "time",     "");
    String eventLocation = getValue(event, "location", "");
    String eventCategory = getValue(event, "category", "");

    // Convert purchasedAt (stored as UTC) to IST (Asia/Kolkata, UTC+05:30)
    ZoneId ist = ZoneId.of("Asia/Kolkata");
    ZonedDateTime purchasedIst = ticket.getPurchasedAt()
        .atZone(ZoneId.of("UTC"))
        .withZoneSameInstant(ist);
    String purchasedIstStr = purchasedIst.format(
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z"));

    // QR code encodes all key identifiers so scanners can verify the ticket
    String qrContent = String.format(
        "TICKET:%s|EVENT:%s|USER:%s|STATUS:%s|PURCHASED_IST:%s",
        ticket.getId(), ticket.getEventId(), ticket.getUserId(), ticket.getStatus(), purchasedIstStr
    );

    try (PDDocument document = new PDDocument()) {
      PDPage page = new PDPage(PDRectangle.A4);
      document.addPage(page);

      float W = PDRectangle.A4.getWidth();   // 595 pt
      float H = PDRectangle.A4.getHeight();  // 842 pt

      // Generate QR code BufferedImage and convert to PDImageXObject
      // Use a high resolution (600px) so the QR remains crisp and scannable in the PDF
      BufferedImage qrImage = generateQrImage(qrContent, 600);
      PDImageXObject qrPdf  = LosslessFactory.createFromImage(document, qrImage);

      // --- Fonts ---
      PDType1Font fontBold     = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
      PDType1Font fontRegular  = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
      PDType1Font fontItalic   = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);
      PDType1Font fontMono     = new PDType1Font(Standard14Fonts.FontName.COURIER_BOLD);

      try (PDPageContentStream cs = new PDPageContentStream(document, page)) {

        // ── Background ────────────────────────────────────────────────────────
        setFill(cs, COLOR_BRAND_LIGHT);
        cs.addRect(0, 0, W, H);
        cs.fill();

        // ── Header band ───────────────────────────────────────────────────────
        float headerH = 90;
        setFill(cs, COLOR_BRAND);
        cs.addRect(0, H - headerH, W, headerH);
        cs.fill();

        // Brand name
        setFill(cs, COLOR_WHITE);
        cs.beginText();
        cs.setFont(fontBold, 30);
        cs.newLineAtOffset(40, H - 58);
        cs.showText("EventFlow");
        cs.endText();

        // "TICKET" label aligned right
        cs.beginText();
        cs.setFont(fontRegular, 12);
        cs.newLineAtOffset(W - 90, H - 58);
        cs.showText("TICKET");
        cs.endText();

        // ── White card ────────────────────────────────────────────────────────
        float cardX = 35;
        float cardY = 70;
        float cardW = W - 70;
        float cardH = H - headerH - 80;

        setFill(cs, COLOR_WHITE);
        cs.addRect(cardX, cardY, cardW, cardH);
        cs.fill();

        float contentX = cardX + 28;
        float topY     = cardY + cardH - 30;

        // ── Event title ───────────────────────────────────────────────────────
        setFill(cs, COLOR_TEXT_DARK);
        cs.beginText();
        cs.setFont(fontBold, 20);
        cs.newLineAtOffset(contentX, topY);
        cs.showText(truncate(eventTitle, 50));
        cs.endText();

        // Category badge (coloured label)
        if (!eventCategory.isBlank()) {
          setFill(cs, COLOR_BRAND);
          cs.beginText();
          cs.setFont(fontBold, 9);
          cs.newLineAtOffset(contentX, topY - 18);
          cs.showText("  " + eventCategory.toUpperCase() + "  ");
          cs.endText();
        }

        // ── Horizontal divider ────────────────────────────────────────────────
        float divY1 = topY - 36;
        drawHRule(cs, contentX, divY1, cardW - 56);

        // ── Event detail rows ─────────────────────────────────────────────────
        float detailY = divY1 - 22;

        detailRow(cs, fontRegular, fontBold, contentX, detailY, "DATE",     eventDate.isBlank() ? "—" : eventDate);
        detailRow(cs, fontRegular, fontBold, contentX, detailY - 42, "TIME", eventTime.isBlank() ? "—" : eventTime);
        detailRow(cs, fontRegular, fontBold, contentX, detailY - 84, "LOCATION", truncate(eventLocation, 48));
        detailRow(cs, fontRegular, fontBold, contentX, detailY - 126,
                  "PRICE", "$" + ticket.getPrice().toPlainString());

        // Status row with coloured value
        float statusY = detailY - 168;
        setFill(cs, COLOR_TEXT_MUTED);
        cs.beginText();
        cs.setFont(fontRegular, 8);
        cs.newLineAtOffset(contentX, statusY);
        cs.showText("STATUS");
        cs.endText();

        boolean confirmed = "Confirmed".equalsIgnoreCase(ticket.getStatus());
        setFill(cs, confirmed ? COLOR_SUCCESS : COLOR_BRAND);
        cs.beginText();
        cs.setFont(fontBold, 12);
        cs.newLineAtOffset(contentX, statusY - 14);
        cs.showText(ticket.getStatus().toUpperCase());
        cs.endText();

        // ── Horizontal divider ────────────────────────────────────────────────
        float divY2 = detailY - 210;
        drawHRule(cs, contentX, divY2, cardW - 56);

        // ── Booking reference ─────────────────────────────────────────────────
        float refY = divY2 - 22;
        setFill(cs, COLOR_TEXT_MUTED);
        cs.beginText();
        cs.setFont(fontRegular, 8);
        cs.newLineAtOffset(contentX, refY);
        cs.showText("BOOKING REFERENCE");
        cs.endText();

        setFill(cs, COLOR_TEXT_DARK);
        cs.beginText();
        cs.setFont(fontMono, 10);
        cs.newLineAtOffset(contentX, refY - 14);
        cs.showText(ticket.getId().toString().toUpperCase());
        cs.endText();

        // Purchased on
        setFill(cs, COLOR_TEXT_MUTED);
        cs.beginText();
        cs.setFont(fontRegular, 8);
        cs.newLineAtOffset(contentX, refY - 38);
        cs.showText("PURCHASED ON");
        cs.endText();

        String purchasedDate = purchasedIst.toLocalDate().toString();
        String purchasedTime = purchasedIst.format(DateTimeFormatter.ofPattern("HH:mm")) + " IST";

        setFill(cs, COLOR_TEXT_DARK);
        cs.beginText();
        cs.setFont(fontBold, 10);
        cs.newLineAtOffset(contentX, refY - 52);
        cs.showText(purchasedDate + "  |  " + purchasedTime);
        cs.endText();

        // ── QR Code (right side, vertically centred in lower half) ───────────
        float qrSize  = 155;
        float qrRight = cardX + cardW - 28;
        float qrXPos  = qrRight - qrSize;
        float qrYPos  = divY2 - qrSize - 10;

        cs.drawImage(qrPdf, qrXPos, qrYPos, qrSize, qrSize);

        // QR label
        setFill(cs, COLOR_TEXT_MUTED);
        cs.beginText();
        cs.setFont(fontItalic, 8);
        cs.newLineAtOffset(qrXPos + 14, qrYPos - 14);
        cs.showText("SCAN TO VERIFY TICKET");
        cs.endText();

        // ── Footer ─────────────────────────────────────────────────────────────
        float footerY = cardY + 18;
        drawHRule(cs, contentX, footerY + 16, cardW - 56);

        setFill(cs, COLOR_TEXT_MUTED);
        cs.beginText();
        cs.setFont(fontItalic, 8);
        cs.newLineAtOffset(contentX, footerY);
        cs.showText("This ticket is non-transferable and must be presented at the event entrance.  |  EventFlow \u00A9 2026");
        cs.endText();
      }

      ByteArrayOutputStream out = new ByteArrayOutputStream();
      document.save(out);
      return out.toByteArray();

    } catch (Exception e) {
      throw new RuntimeException("Failed to generate PDF ticket for ticketId=" + ticketId, e);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private BufferedImage generateQrImage(String content, int size) throws Exception {
    QRCodeWriter writer = new QRCodeWriter();
    Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
    hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
    hints.put(EncodeHintType.MARGIN, 1);
    BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size, hints);
    return MatrixToImageWriter.toBufferedImage(matrix);
  }

  /** Renders a labelled two-line detail row (grey label + bold value). */
  private void detailRow(PDPageContentStream cs,
                         PDType1Font labelFont, PDType1Font valueFont,
                         float x, float y,
                         String label, String value) throws Exception {
    setFill(cs, COLOR_TEXT_MUTED);
    cs.beginText();
    cs.setFont(labelFont, 8);
    cs.newLineAtOffset(x, y);
    cs.showText(label);
    cs.endText();

    setFill(cs, COLOR_TEXT_DARK);
    cs.beginText();
    cs.setFont(valueFont, 12);
    cs.newLineAtOffset(x, y - 14);
    cs.showText(value);
    cs.endText();
  }

  /** Draws a horizontal rule. */
  private void drawHRule(PDPageContentStream cs, float x, float y, float width) throws Exception {
    setStroke(cs, COLOR_BORDER);
    cs.setLineWidth(0.5f);
    cs.moveTo(x, y);
    cs.lineTo(x + width, y);
    cs.stroke();
  }

  private void setFill(PDPageContentStream cs, float[] rgb) throws Exception {
    cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
  }

  private void setStroke(PDPageContentStream cs, float[] rgb) throws Exception {
    cs.setStrokingColor(rgb[0], rgb[1], rgb[2]);
  }

  private String getValue(Map<String, Object> map, String key, String defaultValue) {
    if (map == null) return defaultValue;
    Object val = map.get(key);
    return val != null ? val.toString() : defaultValue;
  }

  private String truncate(String text, int maxLen) {
    if (text == null || text.isBlank()) return "";
    return text.length() > maxLen ? text.substring(0, maxLen - 3) + "..." : text;
  }
}
