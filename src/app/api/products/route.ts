import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Product } from "@/types/product";

const DATA_PATH = join(process.cwd(), "src/data/products.json");

function readProducts(): Product[] {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Product[];
}

function writeProducts(products: Product[]) {
  writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), "utf-8");
}

export async function GET() {
  const products = readProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.slug || !body.category || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, category, price" },
        { status: 400 },
      );
    }

    const products = readProducts();

    const newProduct: Product = {
      ...body,
      id: `${body.category.slice(0, 5)}-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    products.push(newProduct);
    writeProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
