document.addEventListener('DOMContentLoaded', () => {
    const checkInButton = document.getElementById('checkInButton');
    const studentNumberInput = document.getElementById('studentNumber');
    const attendanceTable = document.getElementById('attendanceTable');
    const clearRecordsButton = document.getElementById('clearRecordsButton');
    const downloadRecordsButton = document.getElementById('downloadRecordsButton');
    const deletionKey = '2235'; // 삭제 및 초기화 키 설정

    // 더미 데이터: 학생 이름과 학번
    const students = [
        { number: '20401', name: '구본수' },
        { number: '20402', name: '권서준' },
        { number: '20403', name: '문정진' },
        { number: '20404', name: '박건' },
        { number: '20405', name: '박경민' },
        { number: '20406', name: '박예원' },
        { number: '20407', name: '박찬혁' },
        { number: '20408', name: '박해성' },
        { number: '20409', name: '안가온' },
        { number: '20410', name: '안영웅' },
        { number: '20411', name: '윤예준' },
        { number: '20412', name: '윤호준' },
        { number: '20413', name: '이건희' },
        { number: '20414', name: '이루마' },
        { number: '20415', name: '이서준' },
        { number: '20416', name: '이준원' },
        { number: '20417', name: '이지환' },
        { number: '20418', name: '임서준' },
        { number: '20419', name: '임주혁' },
        { number: '20420', name: '장서우' },
        { number: '20421', name: '조현서' },
        { number: '20422', name: '천석영' }
    ];

    // 출석 체크 버튼 클릭 시
    checkInButton.addEventListener('click', () => {
        checkAttendance();
    });

    // Enter 키 입력 시 출석 체크
    studentNumberInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkAttendance();
        }
    });

    // 출석 체크 로직
    function checkAttendance() {
        const studentNumber = studentNumberInput.value;
        const student = students.find(stud => stud.number === studentNumber);
        
        // 중복 확인 로직
        const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        const alreadyChecked = existingRecords.find(record => record.studentNumber === studentNumber);

        if (!student) {
            alert('학번을 확인해 주세요.');
            return;
        }

        if (alreadyChecked) {
            alert('이미 출석 체크가 완료된 학번입니다.');
            return;
        }

        const now = new Date();
        const attendanceRecord = {
            studentNumber: student.number,
            name: student.name,
            checkInDate: `${now.getMonth() + 1}월 ${now.getDate()}일`, // 월과 일만 표시
            checkInTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}` // 시:분 형식 (초 제외)
        };
        saveAttendance(attendanceRecord);
        displayAttendance();
        studentNumberInput.value = ''; // 입력 필드 초기화
    }

    // 출석 기록 저장
    function saveAttendance(record) {
        let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        attendanceRecords.push(record);
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    }

    // 출석 기록 표시
    function displayAttendance() {
        const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        const tableBody = attendanceTable.getElementsByTagName('tbody')[0] || document.createElement('tbody');

        if (!attendanceTable.tBodies.length) {
            attendanceTable.appendChild(tableBody);
        }

        tableBody.innerHTML = ''; // 기존 테이블 내용 삭제

        records.forEach((record, index) => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = record.studentNumber;
            row.insertCell(1).textContent = record.name;
            row.insertCell(2).textContent = record.checkInDate; // 날짜
            row.insertCell(3).textContent = record.checkInTime; // 시간
            const deleteCell = row.insertCell(4); // 삭제 버튼을 위한 열 추가
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.onclick = () => {
                deleteAttendance(index);
            };
            deleteCell.appendChild(deleteButton);
        });
    }

    // 특정 출석 기록 삭제
    function deleteAttendance(index) {
        const key = prompt('삭제를 위한 키를 입력하세요:');
        if (key === deletionKey) {
            let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            attendanceRecords.splice(index, 1); // 해당 인덱스의 기록 삭제
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
            displayAttendance(); // 업데이트된 기록 다시 표시
        } else {
            alert('키가 틀렸습니다.');
        }
    }

    // 모든 출석 기록 삭제
    clearRecordsButton.addEventListener('click', () => {
        const key = prompt('초기화를 위한 키를 입력하세요:');
        if (key === deletionKey) {
            localStorage.removeItem('attendanceRecords'); // 모든 기록 삭제
            displayAttendance(); // 테이블 업데이트
        } else {
            alert('키가 틀렸습니다.');
        }
    });

    // 출석 기록 다운로드
    downloadRecordsButton.addEventListener('click', () => {
        const key = prompt('다운로드를 위한 키를 입력하세요:');
        if (key !== deletionKey) {
            alert('키가 틀렸습니다.');
            return;
        }

        const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        if (records.length === 0) {
            alert('출석 기록이 없습니다.');
            return;
        }

        // 현재 날짜를 가져옵니다.
        const now = new Date();
        const dateString = `${now.getMonth() + 1}월 ${now.getDate()}일`; // 날짜 형식

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // UTF-8 BOM 추가
            + "학번,이름,출석 날짜,출석 시간\n"
            + records.map(record => `${record.studentNumber},${record.name},${record.checkInDate},${record.checkInTime}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `출석기록(${dateString}).csv`); // 날짜를 포함하여 파일 이름 지정
        document.body.appendChild(link); // Required for Firefox

        link.click();
        document.body.removeChild(link); // 링크 제거
    });

    // 페이지 로드 시 출석 기록 표시
    displayAttendance();
});