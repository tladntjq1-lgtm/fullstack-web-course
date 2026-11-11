import Link from "next/link";
import MemberWorkspace from "../../components/MemberWorkspace";
import styles from "../../components/member-ui.module.css";

export default function MembersPage() {
  return (
    <main className={styles.app}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Phase 03 · 06강 회원 목록과 상세 이동</p>
          <h1 className={styles.pageTitle}>회원관리 시스템</h1>
          <p className={styles.pageDescription}>
            회원 카드의 [상세 보기]를 눌러 회원 상세 페이지로 이동해요.
          </p>
          <p>
            <Link
              href="/"
              className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
            >
              ← 기존 메인 화면으로
            </Link>
          </p>
        </header>

        <MemberWorkspace />
      </div>
    </main>
  );
}