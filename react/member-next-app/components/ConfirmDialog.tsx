"use client";

import { useEffect, useRef } from "react";
import type { Member } from "../types/member";
import styles from "./member-ui.module.css";

type ConfirmDialogProps = {
  member: Member | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  member,
  busy,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = member !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="delete-dialog-title"
      onCancel={(event) => {
        // Esc 키: 브라우저 기본 닫기 대신 React 상태로 닫습니다.
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(event) => {
        // 바깥 어두운 영역을 누르면 취소합니다.
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      {member && (
        <div className={styles.dialogBody}>
          <div className={styles.dialogIcon} aria-hidden="true">
            !
          </div>
          <div>
            <h2 id="delete-dialog-title" className={styles.dialogTitle}>
              이 회원을 삭제할까요?
            </h2>
            <p className={styles.dialogText}>
              삭제하면 실제 DB에서 지워지고 되돌릴 수 없어요.
            </p>
          </div>

          <div className={styles.dialogMember}>
            <strong>{member.name}</strong>
            <span>{member.email}</span>
            <span>
              나이 {member.age}세 · ID {member.member_id}
            </span>
          </div>

          <div className={styles.dialogActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              disabled={busy}
              onClick={onCancel}
            >
              취소
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonDanger}`}
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}