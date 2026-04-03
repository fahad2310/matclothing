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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const products = readProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  products[index] = { ...products[index], ...body, id };
  writeProducts(products);

  return NextResponse.json(products[index]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const products = readProducts();
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  writeProducts(filtered);
  return NextResponse.json({ success: true });
}
