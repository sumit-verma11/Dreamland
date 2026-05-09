import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });

  // When Cloudinary is not configured, return a deterministic placeholder for dev.
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
    const seed = `nestiq-${session.user.id}-${Date.now()}`;
    return NextResponse.json({
      url: `https://picsum.photos/seed/${seed}/800/600`,
      publicId: seed,
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "nestiq/properties",
    resource_type: "auto",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
}
