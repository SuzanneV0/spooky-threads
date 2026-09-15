"use client";

import { useState } from "react";
import Image from "next/image";
import ProductArt from "@/components/ProductArt";

export default function ProductPhoto({
  slug,
  productType,
  name,
  sizes,
}: {
  slug: string;
  productType: string;
  name: string;
  sizes?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="product-photo">
        <ProductArt slug={slug} productType={productType} />
      </div>
    );
  }

  return (
    <div className="product-photo">
      <Image
        src={`/products/${slug}.png`}
        alt={name}
        fill
        sizes={sizes ?? "(max-width: 640px) 50vw, 260px"}
        style={{ objectFit: "cover" }}
        onError={() => setErrored(true)}
      />
    </div>
  );
}
