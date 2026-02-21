export const productsQuery = `*[_type == "product"] | order(featured desc, _createdAt desc){
  "id": _id,
  title,
  "slug": slug.current,
  price,
  "category": category->{
    "id": _id,
    title,
    "slug": slug.current
  },
  "images": images[].asset->url,
  description,
  featured,
  rating,
  stock,
  inStock,
  badge
}`;

export const categoriesQuery = `*[_type == "category"] | order(title asc){
  "id": _id,
  title,
  "slug": slug.current
}`;
