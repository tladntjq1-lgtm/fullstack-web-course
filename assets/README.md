# Course Image Assets

이 폴더는 `fullstack-web-course-instructor`의 강의안과 학생용 Public 교재에서 공통으로 사용하는 이미지 자산을 저장합니다.

## 폴더 구조

```text
assets/images/
├─ phase01/
│  └─ chapterXX/
├─ phase02/
│  └─ chapterXX/
└─ phase03/
   └─ chapterXX/
```

## 사용 규칙

- 이미지 파일명은 영문 소문자 kebab-case를 사용합니다.
- 강의별 이미지는 해당 phase/chapter 폴더에 저장합니다.
- Private instructor repository는 이 Public repository의 raw URL을 참조합니다.

예시:

```text
https://raw.githubusercontent.com/GilbertMoon/fullstack-web-course/main/assets/images/phase01/chapter12/http-request-response.png
```

강의안 Markdown 예시:

```md
![HTTP 요청/응답 흐름](https://raw.githubusercontent.com/GilbertMoon/fullstack-web-course/main/assets/images/phase01/chapter12/http-request-response.png)
```

이미지는 구조, 흐름, 상태 변화, 데이터 이동을 이해하기 위한 학습 자료로 사용합니다.
