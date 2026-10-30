// 버튼 및 입력 요소 가져오기
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const operatorSelect = document.getElementById('operator');
const calcBtn = document.getElementById('calcBtn');

// 계산 버튼 클릭 이벤트 리스너 등록
calcBtn.addEventListener('click', function () {
    const rawNum1 = num1Input.value.trim();
    const rawNum2 = num2Input.value.trim();
    const operator = operatorSelect.value;

    // 1. 필수 입력값 체크 (비어 있는지)
    if (rawNum1 === '' || rawNum2 === '') {
        alert('두 숫자를 모두 입력해 주세요.');
        return;
    }

    // 2. 숫자가 맞는지 검증 (isNaN 활용)
    if (isNaN(rawNum1) || isNaN(rawNum2)) {
        alert('올바른 숫자를 입력해 주세요.');
        return;
    }

    // 문자열을 숫자(실수 포함)로 변환
    const num1 = Number(rawNum1);
    const num2 = Number(rawNum2);

    // 3. 나눗셈(/) 시 분모가 0인지 체크
    if (operator === '/' && num2 === 0) {
        alert('0으로 나눌 수 없습니다.');
        return;
    }

    // 사칙연산 수행
    let result = 0;
    switch (operator) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            result = num1 / num2;
            break;
    }

    // 연산 결과 alert 표시 (소수점 정리 포함)
    alert(`결과: ${num1} ${operator} ${num2} = ${result}`);
});