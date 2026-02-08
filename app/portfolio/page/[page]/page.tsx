import { notFound } from "next/navigation";
import {
  PortfolioListingPage,
  getPortfolioPageData,
  getPortfolioStaticPageParams,
} from "../../_shared";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getPortfolioStaticPageParams();
}

export default async function PortfolioPaginationPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: rawPage } = await params;
  const page = Number(rawPage);

  if (!Number.isInteger(page) || page < 2) {
    notFound();
  }

  const data = await getPortfolioPageData(page);
  if (data.isOutOfRange) {
    notFound();
  }

  return <PortfolioListingPage page={page} data={data} />;
}
