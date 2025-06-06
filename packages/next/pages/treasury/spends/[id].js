import React from "react";
import { withCommonProps } from "next-common/lib";
import nextApi from "next-common/services/nextApi";
import { getNullDetailProps } from "next-common/services/detail/nullDetail";
import { fetchDetailComments } from "next-common/services/detail";
import { fetchOpenGovTracksProps } from "next-common/services/serverSide";
import { EmptyList } from "next-common/utils/constants";
import { PostProvider, usePost } from "next-common/context/post";
import DetailLayout from "next-common/components/layout/DetailLayout";
import useDetailPageSeoInfo from "next-common/hooks/common/useDetailPageSeoInfo";
import { usePageProps } from "next-common/context/page";
import CheckUnFinalizedBase from "next-common/components/checkUnFinalizedBase";
import ContentWithComment from "next-common/components/detail/common/contentWithComment";
import TreasurySpendDetail from "next-common/components/detail/treasury/spend";
import TreasurySpendPayout from "next-common/components/detail/treasury/spend/payout";
import useSubscribePostDetail from "next-common/hooks/useSubscribePostDetail";
import {
  TreasuryProvider,
  useTreasuryPallet,
} from "next-common/context/treasury";
import MaybeSimaContent from "next-common/components/detail/maybeSimaContent";
import TreasurySpeedsDetailMultiTabs from "components/tabs/treasurySpeedsDetailMultiTabs";

function TreasurySpendContent() {
  const detail = usePost();
  useSubscribePostDetail(detail?.index);

  return (
    <MaybeSimaContent>
      <ContentWithComment>
        <TreasurySpendDetail />
        <TreasurySpendPayout />
        <TreasurySpeedsDetailMultiTabs />
      </ContentWithComment>
    </MaybeSimaContent>
  );
}

function ProposalContentWithNullGuard({ detailApiPath, children }) {
  const { id } = usePageProps();
  const detail = usePost();
  const treasuryPallet = useTreasuryPallet();

  if (!detail) {
    return (
      <CheckUnFinalizedBase
        onChainDataFetcher={async (api) =>
          api.query[treasuryPallet]?.spends(id)
        }
        serverPostFetcher={() => nextApi.fetch(`${detailApiPath}/${id}`)}
      />
    );
  }

  return children;
}

function SpendPageImpl({ detailApiPath, children }) {
  const seoInfo = useDetailPageSeoInfo();

  return (
    <DetailLayout seoInfo={seoInfo} hasSidebar={true}>
      <ProposalContentWithNullGuard detailApiPath={detailApiPath}>
        {children}
      </ProposalContentWithNullGuard>
    </DetailLayout>
  );
}

export function CommonSpendPageWrapper({
  post,
  pallet,
  detailApiPath,
  children,
}) {
  return (
    <PostProvider post={post}>
      <TreasuryProvider pallet={pallet}>
        <SpendPageImpl detailApiPath={detailApiPath}>{children}</SpendPageImpl>
      </TreasuryProvider>
    </PostProvider>
  );
}

export default function SpendPage({ detail }) {
  return (
    <CommonSpendPageWrapper
      post={detail}
      pallet="treasury"
      detailApiPath="treasury/spends"
    >
      <TreasurySpendContent />
    </CommonSpendPageWrapper>
  );
}

export const getServerSideProps = withCommonProps(async (context) => {
  const { id } = context.query;
  const { result: detail } = await nextApi.fetch(`treasury/spends/${id}`);

  if (!detail) {
    return getNullDetailProps(id);
  }

  const comments = await fetchDetailComments(
    `treasury/spends/${detail._id}/comments`,
    context,
  );
  const tracksProps = await fetchOpenGovTracksProps();

  return {
    props: {
      detail,
      comments: comments ?? EmptyList,
      ...tracksProps,
    },
  };
});
