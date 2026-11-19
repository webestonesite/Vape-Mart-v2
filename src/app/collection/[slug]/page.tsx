import CollectionSlugPage, {
  generateMetadata,
  generateStaticParams,
} from "../../collections/[slug]/page";

export const dynamicParams = true;
export const revalidate = 86400;

export { generateMetadata, generateStaticParams };
export default CollectionSlugPage;
