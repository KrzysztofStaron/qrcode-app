import { Options } from "next/dist/server/base-server";
import { NextResponse } from "next/server";
import { toDataURL } from "qrcode";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate that the content field is present
    if (!data.content) {
      return NextResponse.json(
        { error: "Content field is required" },
        { status: 400 }
      );
    }

    // Use default options if none are provided
    let options: any = {};

    if (data.options?.margin) {
      options.margin = data.options.margin ?? 1;
    }
    if (data.options?.errorCorrectionLevel) {
      if (
        data.options.errorCorrectionLevel != "L" &&
        data.options.errorCorrectionLevel != "M" &&
        data.options.errorCorrectionLevel != "Q" &&
        data.options.errorCorrectionLevel != "H"
      ) {
        return NextResponse.json(
          { error: "Invalid error correction level" },
          { status: 400 }
        );
      }
      options.errorCorrectionLevel = data.options.errorCorrectionLevel ?? "M";
    }
    const qrCode = await toDataURL(data.content, options);

    return NextResponse.json({ data: qrCode });
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON format:", error);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
