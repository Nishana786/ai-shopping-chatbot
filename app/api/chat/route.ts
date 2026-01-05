export const runtime = "nodejs";
import { NextResponse } from "next/server";
import products from "@/data/products.json";
import { askOpenAI } from "@/lib/openai";


let cart: any[] = [];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "Please type a message" });
    }

    const lower = message.toLowerCase();

    // Show products
    if (lower.includes("show")) {
      return NextResponse.json({
        reply: products.map((p) => `${p.name} - ₹${p.price}`).join("\n"),
      });
    }

    // Checkout
    if (lower.includes("checkout")) {
      if (cart.length === 0) {
        return NextResponse.json({
          reply: "Your cart is empty",
        });
      }

      const total = cart.reduce((sum, p) => sum + p.price, 0);
      cart = [];

      return NextResponse.json({
        reply: `Order confirmed Total amount: ₹${total}`,
      });
    }

    // Add to cart
    const product = products.find((p) =>
      lower.includes(p.name.toLowerCase())
    );

    if (product) {
      cart.push(product);
      return NextResponse.json({
        reply: `${product.name} added to cart. Anything else?`,
      });
    }

    // OpenAI fallback
    const aiReply = await askOpenAI(message);
    return NextResponse.json({ reply: aiReply });
  } catch (error: any) {
  console.error("🔥 CHAT API ERROR:", error);

  return NextResponse.json({
    reply: `ERROR: ${error?.message || JSON.stringify(error)}`,
  });
}

}
