import MemberWorkspace from "../components/MemberWorkspace";
import styles from "../components/member-ui.module.css";

export default function HomePage() {
  return (
    <main className={styles.app}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Phase 03 · 05강 회원 CRUD</p>
          <h1 className={styles.pageTitle}>회원관리 시스템</h1>
          <p className={styles.pageDescription}>
            FastAPI와 PostgreSQL에 연결된 회원 목록이에요. 등록·수정·삭제를 하면
            최신 목록을 자동으로 다시 불러와요.
          </p>
        </header>

        <MemberWorkspace />
      </div>
    </main>
  );
}