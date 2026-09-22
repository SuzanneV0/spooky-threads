import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "@/components/ProductCard";
import { CartProvider, useCart } from "@/components/CartProvider";
import { CompareProvider } from "@/components/CompareProvider";
import type { Product } from "@/lib/queries";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "spooky-tee",
    name: "Spooky Tee",
    description: "A very spooky tee.",
    price_cents: 2500,
    product_type: "mug",
    wash_instructions: "Hand wash.",
    image_svg: null,
    is_new: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// A small consumer so tests can observe cart state changes caused by
// clicking "Add to cart" inside ProductCard.
function CartCount() {
  const { count } = useCart();
  return <span data-testid="cart-count">{count}</span>;
}

function renderCard(product: Product) {
  return render(
    <CartProvider>
      <CompareProvider>
        <ProductCard product={product} />
        <CartCount />
      </CompareProvider>
    </CartProvider>
  );
}

describe("ProductCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the product name and price", () => {
    renderCard(makeProduct({ name: "Pumpkin Mug", price_cents: 1600 }));

    expect(screen.getByText("Pumpkin Mug")).toBeInTheDocument();
    expect(screen.getByText("$16.00")).toBeInTheDocument();
  });

  it("shows a New badge only when the product is marked new", () => {
    const { rerender } = renderCard(makeProduct({ is_new: true }));
    expect(screen.getByText("New")).toBeInTheDocument();

    rerender(
      <CartProvider>
        <CompareProvider>
          <ProductCard product={makeProduct({ is_new: false })} />
        </CompareProvider>
      </CartProvider>
    );
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("shows 'Select size' instead of 'Add to cart' for apparel that needs a size", () => {
    renderCard(makeProduct({ product_type: "shirt" }));

    expect(screen.getByRole("link", { name: "Select size" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add to cart" })).not.toBeInTheDocument();
  });

  it("adds the product to the cart when 'Add to cart' is clicked", async () => {
    const user = userEvent.setup();
    renderCard(makeProduct({ product_type: "mug" }));

    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
  });

  it("toggles the compare checkbox on and off", async () => {
    const user = userEvent.setup();
    renderCard(makeProduct());

    const checkbox = screen.getByRole("checkbox", { name: /compare/i });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("disables the compare checkbox once 3 other products are already selected", () => {
    localStorage.setItem(
      "spooky-threads-compare",
      JSON.stringify([
        { id: "other-1", slug: "a", name: "A" },
        { id: "other-2", slug: "b", name: "B" },
        { id: "other-3", slug: "c", name: "C" },
      ])
    );

    renderCard(makeProduct({ id: "p1" }));

    expect(screen.getByRole("checkbox", { name: /compare/i })).toBeDisabled();
  });
});
