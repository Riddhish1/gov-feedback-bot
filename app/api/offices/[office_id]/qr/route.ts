import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { connectDB } from "@/lib/db";
import Office from "@/models/Office";

/**
 * Builds the WhatsApp deep-link URL.
 * Scanning this QR opens WhatsApp with ONLY the office_id pre-filled.
 * The user just taps Send — no ugly START_OFFICE_ prefix visible.
 *
 * Format:  https://wa.me/<number>?text=<office_id>
 * Number:  strip "whatsapp:+" prefix from TWILIO_WHATSAPP_NUMBER
 */
function buildWhatsAppLink(officeId: string): string {
  const raw = process.env.TWILIO_WHATSAPP_NUMBER ?? "";
  // "whatsapp:+14155238886" → "14155238886"
  const number = raw.replace(/^whatsapp:\+?/i, "").trim();
  // Pre-fill just the office ID — clean and minimal
  const text = encodeURIComponent(officeId);
  return `https://wa.me/${number}?text=${text}`;
}

/**
 * GET /api/offices/[office_id]/qr
 *
 * Returns a QR code image for the given office.
 *
 * Query params:
 *   format   = "png" (default) | "svg"
 *   size     = pixel size for PNG (default 300)
 *   download = "true"  → forces browser download instead of inline display
 *
 * Examples:
 *   /api/offices/1023/qr               → inline PNG
 *   /api/offices/1023/qr?format=svg    → inline SVG
 *   /api/offices/1023/qr?download=true → download PNG
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ office_id: string }> }
) {
  try {
    const { office_id } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") ?? "png").toLowerCase();
    const size = Math.min(Math.max(parseInt(searchParams.get("size") ?? "300", 10), 100), 1000);
    const download = searchParams.get("download") === "true";

    if (!office_id) {
      return NextResponse.json({ error: "office_id is required" }, { status: 400 });
    }

    // Verify the office exists
    await connectDB();
    const office = await Office.findOne({ office_id }).lean();
    if (!office) {
      return NextResponse.json(
        { error: `Office "${office_id}" not found` },
        { status: 404 }
      );
    }

    const waLink = buildWhatsAppLink(office_id);

    if (format === "svg") {
      const svg = await QRCode.toString(waLink, {
        type: "svg",
        width: size,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });

      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
          ...(download
            ? {
                "Content-Disposition": `attachment; filename="qr-office-${office_id}.svg"`,
              }
            : {}),
        },
      });
    }

    // Default: PNG
    const buffer: Buffer = await QRCode.toBuffer(waLink, {
      type: "png",
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // Extract a proper ArrayBuffer (BodyInit-compatible) from the Node Buffer
    const arrayBuffer: ArrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        ...(download
          ? {
              "Content-Disposition": `attachment; filename="qr-office-${office_id}.png"`,
            }
          : {}),
      },
    });
  } catch (error) {
    console.error("[GET /api/offices/[office_id]/qr]", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
