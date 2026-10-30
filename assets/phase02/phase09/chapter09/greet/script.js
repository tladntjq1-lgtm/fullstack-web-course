// 1. 함수 기본 실습
function greet(name, age) {
    return `안녕하세요, ${age}세 ${name}님! 환영합니다.`;
}

// 2. HTML 요소 가져오기
const nameInput = document.getElementById('nameInput');
const ageInput = document.getElementById('ageInput');
const btn = document.getElementById('greetBtn');
const greetingBox = document.getElementById('greeting-box');
const userListEl = document.getElementById('user-list');
const activeUserListEl = document.getElementById('active-user-list');

// 최초 기본 인사말 출력
greetingBox.innerHTML = `<p><strong>안녕하세요, 김코딩님! 환영합니다.</strong></p>`;

// 3. 객체(Object)와 배열(Array) 데이터 구조 (초기 회원 목록)
let users = [
    { id: 1, name: '김철수', age: 25, isActive: true },
    { id: 2, name: '이영희', age: 30, isActive: false },
    { id: 3, name: '박민수', age: 28, isActive: true },
    { id: 4, name: '최지우', age: 24, isActive: false }
];

// 화면에 회원 목록을 그려주는 함수 (재사용하기 위해 함수로 만듦)
function renderUsers() {
    // map() 활용: 전체 회원 목록 렌더링
    const userHtmls = users.map(user => {
        return `<li>이름: ${user.name} / 나이: ${user.age}세 (ID: ${user.id}, 활성: ${user.isActive})</li>`;
    });
    userListEl.innerHTML = userHtmls.join('');

    // filter() 활용: isActive가 true인 활성 회원만 렌더링
    const activeUsers = users.filter(user => user.isActive);
    const activeUserHtmls = activeUsers.map(user => {
        return `<li>활성 회원 이름: ${user.name}</li>`;
    });
    activeUserListEl.innerHTML = activeUserHtmls.join('');
}

// 페이지가 처음 켜졌을 때 목록 한 번 그려주기
renderUsers();


// 4. [확인] 버튼을 눌렀을 때 새로운 회원 추가하기
btn.onclick = function() {
    const userName = nameInput.value;
    const userAge = Number(ageInput.value); // 나이를 숫자로 변환

    if (!userName || !userAge) {
        alert('이름과 나이를 모두 입력해주세요!');
        return;
    }

    // 조건 1: id는 마지막 회원의 id + 1 (회원이 아예 없으면 1부터 시작)
    const lastId = users.length > 0 ? users[users.length - 1].id : 0;
    const newId = lastId + 1;

    // 조건 2: 나이가 50세 이상이면 false, 아니면 true
    const newIsActive = userAge < 50;

    // 새로운 회원 객체 만들기
    const newUser = {
        id: newId,
        name: userName,
        age: userAge,
        isActive: newIsActive
    };

    // 배열에 새 회원 추가하기 (.push)
    users.push(newUser);

    // alert 및 콘솔 출력
    alert(`추가 완료! 이름: ${userName}, 나이: ${userAge}세`);
    console.log('새로 추가된 회원:', newUser);

    // 인사말 변경
    const message = greet(userName, userAge);
    greetingBox.innerHTML = `<p><strong>${message}</strong></p>`;

    // 화면 목록 최신화하여 다시 그리기!
    renderUsers();

    // 입력창 초기화
    nameInput.value = '';
    ageInput.value = '';
};