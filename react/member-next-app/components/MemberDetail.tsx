"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMember } from "../lib/members-api";
import type { Member } from "../types/member";
import styles from "./member-ui.module.css";

type MemberDetailProps = {
  memberIdText: string;
};

function getInitial(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toUpperCase() : "?";
}

function getAvatarColor(memberId: number): string {
  const hue = (memberId * 47) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

export default function MemberDetail({ memberIdText }: MemberDetailProps) {
  const memberId = Number(memberIdText);
  const validId =
    /^\d+$/.test(memberIdText) && Number.isSafeInteger(memberId) && memberId > 0;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(validId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();

    getMember(memberId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setMember(data);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught instanceof Error ? caught.message : "회원 상세 조회 오류");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [memberId, validId]);

  const notFound = error.includes("HTTP 404");
  const connectionFailed = error.includes("Failed to fetch");

  return (
    <section aria-labelledby="member-detail-title">
      <header className={styles.pageHeader}>
        <p>
          <Link
            href="/members"
            className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
          >
            ← 회원 목록으로 돌아가기
          </Link>
        </p>
        <p className={styles.eyebrow}>Phase 03 · 06강 회원 상세</p>
        <h1 id="member-detail-title" className={styles.pageTitle}>
          회원 상세
        </h1>
      </header>

      {!validId ? (
        <div role="alert" className={styles.errorState}>
          <strong>올바른 회원 ID가 아니에요</strong>
          <span>주소의 회원 ID는 1 이상의 숫자여야 해요. (입력값: {memberIdText})</span>
        </div>
      ) : loading ? (
        <div role="status" aria-label="회원 정보를 불러오는 중입니다" className={styles.detailCard}>
          <div className={styles.skeletonCard} />
        </div>
      ) : notFound ? (
        <div role="alert" className={styles.emptyState}>
          <p className={styles.emptyTitle}>ID {memberId} 회원을 찾을 수 없어요</p>
          <p>이미 삭제되었거나 존재하지 않는 회원이에요.</p>
          <Link
            href="/members"
            className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
          >
            회원 목록 보기
          </Link>
        </div>
      ) : error ? (
        <div role="alert" className={styles.errorState}>
          <strong>회원 정보를 불러오지 못했어요</strong>
          <span>
            {connectionFailed
              ? "서버에 연결할 수 없어요. FastAPI가 켜져 있는지 확인해 주세요."
              : error}
          </span>
        </div>
      ) : member ? (
        <article className={styles.detailCard}>
          <div className={styles.detailHead}>
            <div
              className={`${styles.avatar} ${styles.avatarLarge}`}
              style={{ backgroundColor: getAvatarColor(member.member_id) }}
              aria-hidden="true"
            >
              {getInitial(member.name)}
            </div>
            <div>
              <h2 className={styles.detailName}>{member.name}</h2>
              <p className={styles.cardEmail}>{member.email}</p>
            </div>
          </div>

          <dl className={styles.detailList}>
            <div className={styles.detailRow}>
              <dt>회원 ID</dt>
              <dd>{member.member_id}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>이름</dt>
              <dd>{member.name}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>이메일</dt>
              <dd>{member.email}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>나이</dt>
              <dd>{member.age}세</dd>
            </div>
          </dl>
        </article>
      ) : (
        <div role="alert" className={styles.emptyState}>
          <p className={styles.emptyTitle}>회원 정보를 찾을 수 없어요</p>
        </div>
      )}
    </section>
  );
}