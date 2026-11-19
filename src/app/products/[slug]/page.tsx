import { redirect } from "next/navigation";

export const dynamicParams = true;
export const revalidate = 86400;

export default async function ProductAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
