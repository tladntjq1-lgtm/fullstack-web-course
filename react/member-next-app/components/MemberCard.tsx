import type { Member } from "../types/member";
import styles from "./member-ui.module.css";

type MemberCardProps = {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  busy: boolean;
  editing: boolean;
  deleting: boolean;
};

function getInitial(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toUpperCase() : "?";
}

function getAvatarColor(memberId: number): string {
  const hue = (memberId * 47) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

export default function MemberCard({
  member,
  onEdit,
  onDelete,
  busy,
  editing,
  deleting,
}: MemberCardProps) {
  return (
    <li className={`${styles.card} ${editing ? styles.cardEditing : ""}`}>
      <div
        className={styles.avatar}
        style={{ backgroundColor: getAvatarColor(member.member_id) }}
        aria-hidden="true"
      >
        {getInitial(member.name)}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardName}>{member.name}</h3>
          {editing && <span className={styles.badge}>수정 중</span>}
        </div>
        <p className={styles.cardEmail}>{member.email}</p>
        <p className={styles.cardMeta}>
          <span>나이 {member.age}세</span>
          <span aria-hidden="true">·</span>
          <span>ID {member.member_id}</span>
        </p>
      </div>

      <div className={styles.cardActions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
          disabled={busy}
          onClick={() => onEdit(member)}
          aria-label={`${member.name} 회원 수정`}
        >
          수정
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonDangerOutline} ${styles.buttonSmall}`}
          disabled={busy}
          onClick={() => onDelete(member)}
          aria-label={`${member.name} 회원 삭제`}
        >
          {deleting ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              삭제 중
            </>
          ) : (
            "삭제"
          )}
        </button>
      </div>
    </li>
  );
}