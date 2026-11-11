import type { Member } from "../types/member";
import MemberCard from "./MemberCard";
import styles from "./member-ui.module.css";

type MemberListProps = {
  members: Member[];
  totalCount: number;
  keyword: string;
  onClearSearch: () => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  busy: boolean;
  editingId: number | null;
  deletingId: number | null;
};

export default function MemberList({
  members,
  totalCount,
  keyword,
  onClearSearch,
  onEdit,
  onDelete,
  busy,
  editingId,
  deletingId,
}: MemberListProps) {
  return (
    <div>
      <div className={styles.listHeader}>
        <h2 id="member-list-title" className={styles.sectionTitle}>
          회원 목록
        </h2>
        <p className={styles.countText} aria-live="polite">
          {keyword ? (
            <>
              전체 {totalCount}명 중 <strong>{members.length}명</strong>
            </>
          ) : (
            <>
              전체 <strong>{totalCount}명</strong>
            </>
          )}
        </p>
      </div>

      {totalCount === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>아직 등록된 회원이 없어요</p>
          <p>회원 등록 폼에서 첫 테스트 회원을 등록해 보세요.</p>
        </div>
      ) : members.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>
            &lsquo;{keyword}&rsquo;와 일치하는 회원이 없어요
          </p>
          <p>이름이나 이메일을 다시 확인해 주세요.</p>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
            onClick={onClearSearch}
          >
            검색 초기화
          </button>
        </div>
      ) : (
        <ul
          className={`${styles.cardList} ${busy ? styles.cardListBusy : ""}`}
          aria-busy={busy}
        >
          {members.map((member) => (
            <MemberCard
              key={member.member_id}
              member={member}
              onEdit={onEdit}
              onDelete={onDelete}
              busy={busy}
              editing={editingId === member.member_id}
              deleting={deletingId === member.member_id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}