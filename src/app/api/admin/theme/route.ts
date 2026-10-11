import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import defaultTheme from "@/data/theme-published.json";

const THEME_PATH = path.join(process.cwd(), "src", "data", "theme-published.json");

export async function GET() {
  try {
    const fileContent = await fs.readFile(THEME_PATH, "utf-8");
    const parsed = JSON.parse(fileContent);
    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Failed to read theme file:", err);
    return NextResponse.json({ success: true, data: defaultTheme });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let currentData = defaultTheme;

    try {
      const fileContent = await fs.readFile(THEME_PATH, "utf-8");
      currentData = JSON.parse(fileContent);
    } catch {
      // fallback to default
    }

    // Merge or update header/full theme safely
    const updatedData = {
      ...currentData,
      ...body,
    };

    await fs.writeFile(THEME_PATH, JSON.stringify(updatedData, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Theme updated successfully",
      data: updatedData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to update theme:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
