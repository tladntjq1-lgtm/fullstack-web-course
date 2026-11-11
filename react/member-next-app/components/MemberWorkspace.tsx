"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import ConfirmDialog from "./ConfirmDialog";
import MemberList from "./MemberList";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../lib/members-api";
import { GENDER_OPTIONS, isGender } from "../lib/gender";
import type { Gender, Member } from "../types/member";
import styles from "./member-ui.module.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Toast = { id: number; type: "success" | "error"; message: string };
type Touched = { name: boolean; email: boolean; age: boolean };
const UNTOUCHED: Touched = { name: false, email: false, age: false };

// API 오류를 사람이 읽기 쉬운 문장으로 바꿉니다. (API 호출 방식은 그대로)
function toFriendlyMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "";
  if (raw.includes("Failed to fetch")) {
    return "서버에 연결할 수 없어요. FastAPI가 켜져 있는지 확인해 주세요.";
  }
  const status = Number(/HTTP (\d{3})/.exec(raw)?.[1]);
  if (status === 409) return "이미 사용 중인 이메일이에요. 다른 이메일을 입력해 주세요. (HTTP 409)";
  if (status === 422) return "서버가 입력값 형식을 받아들이지 않았어요. 이메일과 나이를 확인해 주세요. (HTTP 422)";
  if (status === 404) return "이미 삭제되었거나 없는 회원이에요. [다시 조회]를 눌러 주세요. (HTTP 404)";
  if (status >= 500) return `서버 내부 오류가 발생했어요. 잠시 후 다시 시도해 주세요. (HTTP ${status})`;
  return raw || "알 수 없는 오류가 발생했어요.";
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MemberWorkspace() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [touched, setTouched] = useState<Touched>(UNTOUCHED);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const formRef = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 회원 목록 조회 (4강과 동일한 GET)
  useEffect(() => {
    const controller = new AbortController();

    getMembers(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setMembers(data);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(toFriendlyMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  // 성공 알림은 3.5초 뒤 자동으로 닫습니다. (오류 알림은 직접 닫기)
  useEffect(() => {
    if (!toast || toast.type !== "success") return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(type: Toast["type"], message: string) {
    setToast({ id: Date.now(), type, message });
  }

  function handleReload() {
    setLoading(true);
    setLoadError("");
    setReloadKey((value) => value + 1);
  }

  // ----- 검색 -----
  const keyword = search.trim().toLowerCase();
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword),
  );

  // ----- 입력값 검사 -----
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const ageNumber = Number(age);
  const validAge =
    age.trim() !== "" &&
    Number.isInteger(ageNumber) &&
    ageNumber >= 0 &&
    ageNumber <= 150;
  const validEmail = EMAIL_PATTERN.test(trimmedEmail);
  const validForm = trimmedName !== "" && validEmail && validAge;

  const nameError =
    touched.name && trimmedName === "" ? "이름을 입력해 주세요." : "";
  const emailError = !touched.email
    ? ""
    : trimmedEmail === ""
      ? "이메일을 입력해 주세요."
      : !validEmail
        ? "이메일 형식을 확인해 주세요. 예: hong@example.com"
        : "";
  const ageError =
    (touched.age || age !== "") && !validAge
      ? age.trim() === ""
        ? "나이를 입력해 주세요."
        : "나이는 0~150 사이의 정수로 입력해 주세요."
      : "";

  const isEditing = editingId !== null;
  const editingMember = members.find((member) => member.member_id === editingId);

  function clearForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setAge("");
    setGender("");
    setTouched(UNTOUCHED);
  }

  function startEdit(member: Member) {
    setEditingId(member.member_id);
    setName(member.name);
    setEmail(member.email);
    setAge(String(member.age));
    setGender(member.gender ?? "");
    setTouched(UNTOUCHED);
    setToast(null);
    // 수정 폼으로 이동하고 이름 칸에 커서를 둡니다.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    nameInputRef.current?.focus({ preventScroll: true });
  }

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Escape" && isEditing && !busy) {
      event.preventDefault();
      clearForm();
    }
  }

  // ----- 등록 / 수정 (POST·PUT → GET 재조회) -----
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validForm || busy || loading) return;

    setBusy(true);
    setToast(null);
    let changed = false;
    const action = editingId === null ? "등록" : "수정";

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        age: ageNumber,
        gender: gender === "" ? null : gender,
      };
      if (editingId === null) {
        await createMember(payload);
      } else {
        await updateMember(editingId, payload);
      }
      changed = true;

      const latest = await getMembers();
      setMembers(latest);
      clearForm();
      showToast("success", `${trimmedName} 회원을 ${action}했어요. 최신 목록을 다시 불러왔어요.`);
    } catch (error) {
      showToast(
        "error",
        changed
          ? "저장은 완료됐지만 목록을 다시 불러오지 못했어요. [다시 조회]를 눌러 주세요. " +
              toFriendlyMessage(error)
          : `회원 ${action}에 실패했어요. ` + toFriendlyMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  // ----- 삭제 (확인 모달 → DELETE → GET 재조회) -----
  function requestDelete(member: Member) {
    if (busy || loading) return;
    setPendingDelete(member);
  }

  async function confirmDelete() {
    const target = pendingDelete;
    if (!target || busy) return;

    setBusy(true);
    setDeletingId(target.member_id);
    setToast(null);
    let changed = false;

    try {
      await deleteMember(target.member_id);
      changed = true;

      const latest = await getMembers();
      setMembers(latest);
      if (editingId === target.member_id) clearForm();
      showToast("success", `${target.name} 회원을 삭제했어요. 최신 목록을 다시 불러왔어요.`);
    } catch (error) {
      showToast(
        "error",
        changed
          ? "삭제는 완료됐지만 목록을 다시 불러오지 못했어요. [다시 조회]를 눌러 주세요. " +
              toFriendlyMessage(error)
          : "회원 삭제에 실패했어요. " + toFriendlyMessage(error),
      );
    } finally {
      setBusy(false);
      setDeletingId(null);
      setPendingDelete(null);
    }
  }

  const savingForm = busy && deletingId === null;

  return (
    <div>
      {/* 토스트 알림 */}
      <div className={styles.toastRegion} aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`${styles.toast} ${
              toast.type === "error" ? styles.toastError : styles.toastSuccess
            }`}
          >
            <span className={styles.toastIcon} aria-hidden="true">
              {toast.type === "error" ? "!" : "✓"}
            </span>
            <p className={styles.toastMessage}>{toast.message}</p>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => setToast(null)}
              aria-label="알림 닫기"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className={styles.layout}>
        {/* 왼쪽: 검색 + 목록 */}
        <section className={styles.listPanel} aria-labelledby="member-list-title">
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <label htmlFor="member-search" className={styles.srOnly}>
                회원 검색 (이름 또는 이메일)
              </label>
              <span className={styles.searchIcon}>
                <SearchIcon />
              </span>
              <input
                id="member-search"
                className={styles.input}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="이름 또는 이메일로 검색"
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setSearch("")}
                  aria-label="검색어 지우기"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              disabled={loading || busy}
              onClick={handleReload}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  불러오는 중
                </>
              ) : (
                "다시 조회"
              )}
            </button>
          </div>

          {loading ? (
            <div role="status" aria-label="회원 목록을 불러오는 중입니다">
              <ul className={styles.skeletonList}>
                <li className={styles.skeletonCard} />
                <li className={styles.skeletonCard} />
                <li className={styles.skeletonCard} />
              </ul>
            </div>
          ) : loadError ? (
            <div role="alert" className={styles.errorState}>
              <strong>회원 목록을 불러오지 못했어요</strong>
              <span>{loadError}</span>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
                onClick={handleReload}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <MemberList
              members={filteredMembers}
              totalCount={members.length}
              keyword={search.trim()}
              onClearSearch={() => setSearch("")}
              onEdit={startEdit}
              onDelete={requestDelete}
              busy={busy}
              editingId={editingId}
              deletingId={deletingId}
            />
          )}
        </section>

        {/* 오른쪽: 등록 / 수정 폼 */}
        <section
          ref={formRef}
          className={`${styles.formPanel} ${isEditing ? styles.formPanelEditing : ""}`}
          aria-labelledby="member-form-title"
        >
          <div className={styles.formHeader}>
            <span
              className={`${styles.modeBadge} ${isEditing ? styles.modeBadgeEditing : ""}`}
            >
              {isEditing ? "수정 모드" : "등록 모드"}
            </span>
            <h2 id="member-form-title" className={styles.formTitle}>
              {isEditing ? `회원 수정 · ID ${editingId}` : "새 회원 등록"}
            </h2>
            <p className={styles.formHint}>
              {isEditing
                ? `${editingMember?.name ?? "선택한"} 회원의 정보를 고친 뒤 저장하세요. Esc를 누르면 취소돼요.`
                : "실제 DB에 저장돼요. 반드시 테스트 회원만 등록하세요."}
            </p>
          </div>

          <form
            className={styles.form}
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            onKeyDown={handleFormKeyDown}
            noValidate
          >
            <div className={styles.field}>
              <label htmlFor="member-name" className={styles.label}>
                이름
              </label>
              <input
                ref={nameInputRef}
                id="member-name"
                className={`${styles.input} ${nameError ? styles.inputInvalid : ""}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                placeholder="예: Hong"
                autoComplete="off"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "member-name-error" : undefined}
              />
              {nameError && (
                <p id="member-name-error" className={styles.fieldError}>
                  {nameError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="member-email" className={styles.label}>
                이메일
              </label>
              <input
                id="member-email"
                type="email"
                className={`${styles.input} ${emailError ? styles.inputInvalid : ""}`}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="예: hong@example.com"
                autoComplete="off"
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "member-email-error" : undefined}
              />
              {emailError && (
                <p id="member-email-error" className={styles.fieldError}>
                  {emailError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="member-age" className={styles.label}>
                나이
              </label>
              <input
                id="member-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={150}
                className={`${styles.input} ${ageError ? styles.inputInvalid : ""}`}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
                placeholder="예: 25"
                aria-invalid={ageError ? true : undefined}
                aria-describedby={ageError ? "member-age-error" : undefined}
              />
              {ageError && (
                <p id="member-age-error" className={styles.fieldError}>
                  {ageError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="member-gender" className={styles.label}>
                성별 <span className={styles.optional}>(선택)</span>
              </label>
              <select
                id="member-gender"
                className={styles.input}
                value={gender}
                onChange={(event) => {
                  const value = event.target.value;
                  setGender(isGender(value) ? value : "");
                }}
              >
                <option value="">선택 안 함</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={!validForm || busy || loading}
              >
                {savingForm ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    저장 중...
                  </>
                ) : isEditing ? (
                  "수정 내용 저장"
                ) : (
                  "회원 등록"
                )}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonGhost}`}
                disabled={busy}
                onClick={clearForm}
              >
                {isEditing ? "수정 취소" : "입력 초기화"}
              </button>
            </div>

            {!validForm && !busy && (
              <p className={styles.formNote}>
                이름·이메일·나이를 모두 올바르게 입력하면 버튼이 활성화돼요.
              </p>
            )}
          </form>
        </section>
      </div>

      <ConfirmDialog
        member={pendingDelete}
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </div>
  );
}