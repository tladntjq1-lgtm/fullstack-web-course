import { Suspense } from "react";
import MemberDetail from "../../../components/MemberDetail";
import styles from "../../../components/member-ui.module.css";

type MemberDetailPageProps = {
  params: Promise<{ memberId: string }>;
};

// 주소에서 memberId를 꺼내는 부분 (Next.js 16: params는 Promise라서 await 사용)
async function MemberDetailLoader({ params }: MemberDetailPageProps) {
  const { memberId } = await params;
  // key: 주소의 ID가 바뀌면 상세 화면을 새로 만들어 이전 회원 정보가 남지 않게 합니다.
  return <MemberDetail key={memberId} memberIdText={memberId} />;
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
  return (
    <main className={styles.app}>
      <div className={styles.container}>
        <Suspense
          fallback={
            <div role="status" aria-label="회원 상세 화면을 준비하는 중입니다">
              <div className={styles.skeletonCard} />
            </div>
          }
        >
          <MemberDetailLoader params={params} />
        </Suspense>
      </div>
    </main>
  );
}